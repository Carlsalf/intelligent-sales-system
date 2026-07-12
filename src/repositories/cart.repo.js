const { getDb } = require("../db/connection");

function findClientById(id_cliente) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id_cliente, nombre, estado
       FROM cliente
       WHERE id_cliente = ?`,
      [id_cliente],
      (error, row) => {
        db.close();
        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

function findOpenCartByClient(id_cliente) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
         id_carrito,
         id_cliente,
         estado,
         created_at,
         updated_at,
         converted_at
       FROM carrito
       WHERE id_cliente = ?
         AND estado = 'ABIERTO'
       LIMIT 1`,
      [id_cliente],
      (error, row) => {
        db.close();
        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

function createOpenCart(id_cliente) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO carrito(id_cliente, estado)
       VALUES (?, 'ABIERTO')`,
      [id_cliente],
      function (error) {
        const id_carrito = this?.lastID;
        db.close();

        if (error) return reject(error);

        resolve({
          id_carrito,
          id_cliente,
          estado: "ABIERTO",
        });
      }
    );
  });
}

function findActiveProduct(id_producto) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
         id_producto,
         nombre,
         precio,
         estado
       FROM producto
       WHERE id_producto = ?`,
      [id_producto],
      (error, row) => {
        db.close();
        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

function getCartWithItems(id_carrito) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
         c.id_carrito,
         c.id_cliente,
         c.estado,
         c.created_at,
         c.updated_at,
         c.converted_at,
         cl.nombre AS cliente_nombre
       FROM carrito c
       INNER JOIN cliente cl
         ON cl.id_cliente = c.id_cliente
       WHERE c.id_carrito = ?`,
      [id_carrito],
      (cartError, cart) => {
        if (cartError) {
          db.close();
          return reject(cartError);
        }

        if (!cart) {
          db.close();
          return resolve(null);
        }

        db.all(
          `SELECT
             dc.id_detalle_carrito,
             dc.id_producto,
             p.nombre AS producto_nombre,
             p.precio,
             cat.nombre AS categoria_nombre,
             dc.cantidad,
             ROUND(p.precio * dc.cantidad, 2) AS subtotal,
             dc.created_at,
             dc.updated_at
           FROM detalle_carrito dc
           INNER JOIN producto p
             ON p.id_producto = dc.id_producto
           LEFT JOIN categoria cat
             ON cat.id_categoria = p.id_categoria
           WHERE dc.id_carrito = ?
           ORDER BY dc.id_detalle_carrito ASC`,
          [id_carrito],
          (itemsError, items) => {
            db.close();

            if (itemsError) return reject(itemsError);

            const normalizedItems = items || [];
            const total = normalizedItems.reduce(
              (sum, item) => sum + Number(item.subtotal || 0),
              0
            );

            resolve({
              ...cart,
              items: normalizedItems,
              cantidad_items: normalizedItems.length,
              total_unidades: normalizedItems.reduce(
                (sum, item) => sum + Number(item.cantidad || 0),
                0
              ),
              total_estimado: Number(total.toFixed(2)),
            });
          }
        );
      }
    );
  });
}

function addOrIncrementItem({ id_carrito, id_producto, cantidad }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO detalle_carrito(
         id_carrito,
         id_producto,
         cantidad
       )
       VALUES (?, ?, ?)
       ON CONFLICT(id_carrito, id_producto)
       DO UPDATE SET
         cantidad = detalle_carrito.cantidad + excluded.cantidad,
         updated_at = datetime('now')`,
      [id_carrito, id_producto, cantidad],
      function (error) {
        db.close();

        if (error) return reject(error);

        resolve({
          id_carrito,
          id_producto,
          cantidad_agregada: cantidad,
        });
      }
    );
  });
}

function updateItemQuantity({ id_carrito, id_producto, cantidad }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE detalle_carrito
       SET cantidad = ?,
           updated_at = datetime('now')
       WHERE id_carrito = ?
         AND id_producto = ?`,
      [cantidad, id_carrito, id_producto],
      function (error) {
        const changes = this?.changes || 0;
        db.close();

        if (error) return reject(error);

        resolve({
          updated: changes > 0,
          id_carrito,
          id_producto,
          cantidad,
        });
      }
    );
  });
}

function removeItem({ id_carrito, id_producto }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM detalle_carrito
       WHERE id_carrito = ?
         AND id_producto = ?`,
      [id_carrito, id_producto],
      function (error) {
        const changes = this?.changes || 0;
        db.close();

        if (error) return reject(error);

        resolve({
          removed: changes > 0,
          id_carrito,
          id_producto,
        });
      }
    );
  });
}

function clearCart(id_carrito) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM detalle_carrito
       WHERE id_carrito = ?`,
      [id_carrito],
      function (error) {
        const changes = this?.changes || 0;
        db.close();

        if (error) return reject(error);

        resolve({
          id_carrito,
          removed_items: changes,
        });
      }
    );
  });
}

module.exports = {
  findClientById,
  findOpenCartByClient,
  createOpenCart,
  findActiveProduct,
  getCartWithItems,
  addOrIncrementItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
