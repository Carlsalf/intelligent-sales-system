const { getDb } = require("../db/connection");

function createVentaWithDetalles({ id_cliente, id_usuario, items }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

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

          // Traer precios de productos y calcular subtotales
          const detalles = [];
          let total = 0;

          const getProductoStmt = db.prepare(
            "SELECT id_producto, precio, stock FROM producto WHERE id_producto = ? AND estado = 1"
          );
          const insertDetalleStmt = db.prepare(
            "INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)"
          );
          const updateStockStmt = db.prepare(
            "UPDATE producto SET stock = stock - ?, updated_at = datetime('now') WHERE id_producto = ?"
          );

          let pending = items.length;
          if (pending === 0) {
            db.run("ROLLBACK");
            db.close();
            return reject(new Error("items no puede estar vacío"));
          }

          for (const it of items) {
            const id_producto = Number(it.id_producto);
            const cantidad = Number(it.cantidad);

            if (!Number.isInteger(id_producto) || id_producto <= 0 || !Number.isInteger(cantidad) || cantidad <= 0) {
              db.run("ROLLBACK");
              getProductoStmt.finalize();
              insertDetalleStmt.finalize();
              updateStockStmt.finalize();
              db.close();
              return reject(new Error("Item inválido (id_producto/cantidad)"));
            }

            getProductoStmt.get([id_producto], (err2, prod) => {
              if (err2 || !prod) {
                db.run("ROLLBACK");
                getProductoStmt.finalize();
                insertDetalleStmt.finalize();
                updateStockStmt.finalize();
                db.close();
                return reject(new Error("Producto no encontrado o inactivo"));
              }

              if (prod.stock < cantidad) {
                db.run("ROLLBACK");
                getProductoStmt.finalize();
                insertDetalleStmt.finalize();
                updateStockStmt.finalize();
                db.close();
                return reject(new Error("Stock insuficiente"));
              }

              const precio_unitario = prod.precio;
              const subtotal = Number((precio_unitario * cantidad).toFixed(2));
              total += subtotal;

              insertDetalleStmt.run([id_venta, id_producto, cantidad, precio_unitario, subtotal], (err3) => {
                if (err3) {
                  db.run("ROLLBACK");
                  getProductoStmt.finalize();
                  insertDetalleStmt.finalize();
                  updateStockStmt.finalize();
                  db.close();
                  return reject(err3);
                }

                // actualizar stock
                updateStockStmt.run([cantidad, id_producto], (err4) => {
                  if (err4) {
                    db.run("ROLLBACK");
                    getProductoStmt.finalize();
                    insertDetalleStmt.finalize();
                    updateStockStmt.finalize();
                    db.close();
                    return reject(err4);
                  }

                  detalles.push({ id_producto, cantidad, precio_unitario, subtotal });

                  pending -= 1;
                  if (pending === 0) {
                    // actualizar total venta
                    db.run(
                      "UPDATE venta SET total = ?, updated_at = datetime('now') WHERE id_venta = ?",
                      [Number(total.toFixed(2)), id_venta],
                      (err5) => {
                        if (err5) {
                          db.run("ROLLBACK");
                          getProductoStmt.finalize();
                          insertDetalleStmt.finalize();
                          updateStockStmt.finalize();
                          db.close();
                          return reject(err5);
                        }

                        db.run("COMMIT", (err6) => {
                          getProductoStmt.finalize();
                          insertDetalleStmt.finalize();
                          updateStockStmt.finalize();
                          db.close();
                          if (err6) return reject(err6);

                          resolve({ id_venta, total: Number(total.toFixed(2)), detalles });
                        });
                      }
                    );
                  }
                });
              });
            });
          }
        }
      );
    });
  });
}

function listVentas() {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT v.id_venta, v.fecha, v.total, v.id_cliente, c.nombre AS cliente_nombre, v.id_usuario, v.estado " +
      "FROM venta v " +
      "LEFT JOIN cliente c ON c.id_cliente = v.id_cliente " +
      "WHERE v.estado = 1 " +
      "ORDER BY v.id_venta DESC",
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

module.exports = { createVentaWithDetalles, listVentas };
