const { getDb } = require("../db/connection");

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        return reject(error);
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        return reject(error);
      }

      resolve(row || null);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        return reject(error);
      }

      resolve(rows || []);
    });
  });
}

function closeDb(db) {
  return new Promise((resolve) => {
    db.close(() => resolve());
  });
}

async function getOpenCartSnapshot(id_cliente) {
  const db = getDb();

  try {
    const cart = await get(
      db,
      `SELECT
         id_carrito,
         id_cliente,
         estado,
         created_at,
         updated_at
       FROM carrito
       WHERE id_cliente = ?
         AND estado = 'ABIERTO'
       LIMIT 1`,
      [id_cliente]
    );

    if (!cart) {
      return null;
    }

    const items = await all(
      db,
      `SELECT
         dc.id_detalle_carrito,
         dc.id_producto,
         dc.cantidad,
         p.nombre AS producto_nombre,
         p.precio,
         p.stock,
         p.stock_reservado,
         p.stock_comprometido,
         p.dias_preparacion,
         p.dias_reposicion,
         p.reposicion_confirmada,
         p.estado
       FROM detalle_carrito dc
       INNER JOIN producto p
         ON p.id_producto = dc.id_producto
       WHERE dc.id_carrito = ?
       ORDER BY dc.id_detalle_carrito`,
      [cart.id_carrito]
    );

    return {
      ...cart,
      items,
    };
  } finally {
    await closeDb(db);
  }
}

async function persistCheckout({
  id_carrito,
  id_cliente,
  id_cliente_cuenta = null,
  id_usuario,
  id_direccion_entrega = null,
  canal_venta = "BACKOFFICE",
  direccion_entrega_snapshot = null,
  tipo_entrega,
  pago_estado,
  total,
  fecha_entrega_estimada,
  estado_pedido = "CONFIRMADO",
  items,
}) {
  const db = getDb();

  try {
    await run(
      db,
      "BEGIN IMMEDIATE TRANSACTION"
    );

    const currentCart = await get(
      db,
      `SELECT id_carrito, estado
       FROM carrito
       WHERE id_carrito = ?`,
      [id_carrito]
    );

    if (!currentCart) {
      const error = new Error(
        "El carrito no existe."
      );
      error.status = 404;
      throw error;
    }

    if (currentCart.estado !== "ABIERTO") {
      const error = new Error(
        "El carrito ya fue procesado."
      );
      error.status = 409;
      throw error;
    }

    const saleResult = await run(
      db,
      `INSERT INTO venta(
         id_cliente,
         id_cliente_cuenta,
         id_usuario,
         id_direccion_entrega,
         canal_venta,
         direccion_entrega_snapshot,
         total,
         estado,
         estado_pedido,
         tipo_entrega,
         fecha_entrega_estimada,
         pago_estado
       )
       VALUES (
         ?, ?, ?, ?, ?, ?, ?,
         1,
         ?,
         ?, ?, ?
       )`,
      [
        id_cliente,
        id_cliente_cuenta,
        id_usuario,
        id_direccion_entrega,
        canal_venta,
        direccion_entrega_snapshot,
        total,
        estado_pedido,
        tipo_entrega,
        fecha_entrega_estimada,
        pago_estado,
      ]
    );

    const id_venta = saleResult.lastID;

    for (const item of items) {
      await run(
        db,
        `INSERT INTO detalle_venta(
           id_venta,
           id_producto,
           cantidad,
           precio_unitario,
           subtotal,
           tipo_cumplimiento,
           cantidad_reservada,
           cantidad_comprometida,
           fecha_disponibilidad_estimada
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_venta,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
          item.fulfillmentType,
          item.reservedQuantity,
          item.committedQuantity,
          item.promisedAt,
        ]
      );

      await run(
        db,
        `UPDATE producto
         SET stock_reservado =
               stock_reservado + ?,
             stock_comprometido =
               stock_comprometido + ?,
             updated_at = datetime('now')
         WHERE id_producto = ?`,
        [
          item.reservedQuantity,
          item.committedQuantity,
          item.id_producto,
        ]
      );
    }

    const cartResult = await run(
      db,
      `UPDATE carrito
       SET estado = 'CONVERTIDO',
           converted_at = datetime('now'),
           updated_at = datetime('now')
       WHERE id_carrito = ?
         AND estado = 'ABIERTO'`,
      [id_carrito]
    );

    if (cartResult.changes !== 1) {
      const error = new Error(
        "No fue posible convertir el carrito."
      );
      error.status = 409;
      throw error;
    }

    await run(db, "COMMIT");

    return {
      id_venta,
      id_carrito,
      total,
      fecha_entrega_estimada,
      estado_pedido,
      pago_estado,
      tipo_entrega,
      canal_venta,
    };
  } catch (error) {
    try {
      await run(db, "ROLLBACK");
    } catch {
      // Se conserva el error original.
    }

    throw error;
  } finally {
    await closeDb(db);
  }
}

module.exports = {
  getOpenCartSnapshot,
  persistCheckout,
};
