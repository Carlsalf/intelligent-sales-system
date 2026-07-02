const { getDb } = require("../db/connection");

function createVentaWithDetalles({ id_cliente, id_usuario, items }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const rollback = (error, statements = []) => {
        db.run("ROLLBACK");
        statements.forEach((stmt) => stmt && stmt.finalize());
        db.close();
        reject(error);
      };

      if (!Array.isArray(items) || items.length === 0) {
        db.close();
        return reject(new Error("La venta debe incluir al menos un producto."));
      }

      const validarCliente = (callback) => {
        if (!id_cliente) return callback(null);

        db.get(
          "SELECT id_cliente, nombre, estado FROM cliente WHERE id_cliente = ?",
          [id_cliente],
          (err, cliente) => {
            if (err) return callback(err);
            if (!cliente) return callback(new Error("El cliente seleccionado no existe."));
            if (Number(cliente.estado) === 0) {
              return callback(new Error("No se puede registrar una venta para un cliente dado de baja."));
            }
            callback(null);
          }
        );
      };

      validarCliente((clienteErr) => {
        if (clienteErr) {
          db.run("ROLLBACK");
          db.close();
          return reject(clienteErr);
        }

        db.run(
          "INSERT INTO venta(id_cliente, id_usuario, total, estado) VALUES (?, ?, 0, 1)",
          [id_cliente || null, id_usuario],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              db.close();
              return reject(err);
            }

            const id_venta = this.lastID;
            const detalles = [];
            let total = 0;

            const getProductoStmt = db.prepare(
              "SELECT id_producto, nombre, precio, stock FROM producto WHERE id_producto = ? AND estado = 1"
            );

            const insertDetalleStmt = db.prepare(
              "INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)"
            );

            const updateStockStmt = db.prepare(
              "UPDATE producto SET stock = stock - ?, updated_at = datetime('now') WHERE id_producto = ?"
            );

            let pending = items.length;

            for (const it of items) {
              const id_producto = Number(it.id_producto);
              const cantidad = Number(it.cantidad);

              if (
                !Number.isInteger(id_producto) ||
                id_producto <= 0 ||
                !Number.isInteger(cantidad) ||
                cantidad <= 0
              ) {
                return rollback(
                  new Error("Cada producto de la venta debe tener una cantidad válida."),
                  [getProductoStmt, insertDetalleStmt, updateStockStmt]
                );
              }

              getProductoStmt.get([id_producto], (err2, prod) => {
                if (err2 || !prod) {
                  return rollback(
                    new Error("Uno de los productos seleccionados no existe o no está disponible."),
                    [getProductoStmt, insertDetalleStmt, updateStockStmt]
                  );
                }

                if (Number(prod.stock) < cantidad) {
                  return rollback(
                    new Error(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}.`),
                    [getProductoStmt, insertDetalleStmt, updateStockStmt]
                  );
                }

                const precio_unitario = Number(prod.precio);
                const subtotal = Number((precio_unitario * cantidad).toFixed(2));
                total += subtotal;

                insertDetalleStmt.run(
                  [id_venta, id_producto, cantidad, precio_unitario, subtotal],
                  (err3) => {
                    if (err3) {
                      return rollback(err3, [getProductoStmt, insertDetalleStmt, updateStockStmt]);
                    }

                    updateStockStmt.run([cantidad, id_producto], (err4) => {
                      if (err4) {
                        return rollback(err4, [getProductoStmt, insertDetalleStmt, updateStockStmt]);
                      }

                      detalles.push({
                        id_producto,
                        producto_nombre: prod.nombre,
                        cantidad,
                        precio_unitario,
                        subtotal,
                      });

                      pending -= 1;

                      if (pending === 0) {
                        db.run(
                          "UPDATE venta SET total = ?, updated_at = datetime('now') WHERE id_venta = ?",
                          [Number(total.toFixed(2)), id_venta],
                          (err5) => {
                            if (err5) {
                              return rollback(err5, [getProductoStmt, insertDetalleStmt, updateStockStmt]);
                            }

                            db.run("COMMIT", (err6) => {
                              getProductoStmt.finalize();
                              insertDetalleStmt.finalize();
                              updateStockStmt.finalize();
                              db.close();

                              if (err6) return reject(err6);

                              resolve({
                                id_venta,
                                total: Number(total.toFixed(2)),
                                detalles,
                              });
                            });
                          }
                        );
                      }
                    });
                  }
                );
              });
            }
          }
        );
      });
    });
  });
}

function listVentas() {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
         v.id_venta,
         v.fecha,
         v.total,
         v.id_cliente,
         COALESCE(c.nombre, 'Cliente no registrado') AS cliente_nombre,
         v.id_usuario,
         v.estado,
         COUNT(dv.id_detalle) AS cantidad_items
       FROM venta v
       LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
       LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
       GROUP BY v.id_venta
       ORDER BY v.id_venta DESC`,
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function getVentaById(id_venta) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
         v.id_venta,
         v.fecha,
         v.total,
         v.id_cliente,
         COALESCE(c.nombre, 'Cliente no registrado') AS cliente_nombre,
         v.id_usuario,
         v.estado
       FROM venta v
       LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
       WHERE v.id_venta = ?`,
      [id_venta],
      (err, venta) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (!venta) {
          db.close();
          return resolve(null);
        }

        db.all(
          `SELECT 
             dv.id_detalle,
             dv.id_producto,
             p.nombre AS producto_nombre,
             dv.cantidad,
             dv.precio_unitario,
             dv.subtotal
           FROM detalle_venta dv
           LEFT JOIN producto p ON p.id_producto = dv.id_producto
           WHERE dv.id_venta = ?
           ORDER BY dv.id_detalle ASC`,
          [id_venta],
          (err2, detalles) => {
            db.close();
            if (err2) return reject(err2);
            resolve({ ...venta, detalles: detalles || [] });
          }
        );
      }
    );
  });
}

module.exports = {
  createVentaWithDetalles,
  listVentas,
  getVentaById,
};

function cancelVenta(id_venta) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.get(
        "SELECT id_venta, estado FROM venta WHERE id_venta = ?",
        [id_venta],
        (err, venta) => {
          if (err) {
            db.run("ROLLBACK");
            db.close();
            return reject(err);
          }

          if (!venta) {
            db.run("ROLLBACK");
            db.close();
            return reject(new Error("Venta no encontrada."));
          }

          if (Number(venta.estado) === 0) {
            db.run("ROLLBACK");
            db.close();
            return reject(new Error("La venta ya se encuentra anulada."));
          }

          db.all(
            "SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = ?",
            [id_venta],
            (err2, detalles) => {
              if (err2) {
                db.run("ROLLBACK");
                db.close();
                return reject(err2);
              }

              let pending = detalles.length;

              const finishCancel = () => {
                db.run(
                  "UPDATE venta SET estado = 0, updated_at = datetime('now') WHERE id_venta = ?",
                  [id_venta],
                  (err3) => {
                    if (err3) {
                      db.run("ROLLBACK");
                      db.close();
                      return reject(err3);
                    }

                    db.run("COMMIT", (err4) => {
                      db.close();
                      if (err4) return reject(err4);
                      resolve({ id_venta, estado: 0, message: "Venta anulada e inventario repuesto correctamente." });
                    });
                  }
                );
              };

              if (pending === 0) return finishCancel();

              detalles.forEach((item) => {
                db.run(
                  "UPDATE producto SET stock = stock + ?, updated_at = datetime('now') WHERE id_producto = ?",
                  [item.cantidad, item.id_producto],
                  (err5) => {
                    if (err5) {
                      db.run("ROLLBACK");
                      db.close();
                      return reject(err5);
                    }

                    pending -= 1;
                    if (pending === 0) finishCancel();
                  }
                );
              });
            }
          );
        }
      );
    });
  });
}

module.exports.cancelVenta = cancelVenta;
