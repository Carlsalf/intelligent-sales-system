const { getDb } = require("../db/connection");

function listProductos() {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT p.id_producto, p.nombre, p.precio, p.stock, p.id_categoria, c.nombre AS categoria_nombre, p.estado, p.created_at, p.updated_at " +
      "FROM producto p " +
      "JOIN categoria c ON c.id_categoria = p.id_categoria " +
      "WHERE p.estado = 1 " +
      "ORDER BY p.nombre ASC",
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function createProducto({ nombre, precio, stock, id_categoria }) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO producto(nombre, precio, stock, id_categoria, estado) VALUES (?, ?, ?, ?, 1)",
      [nombre, precio, stock, id_categoria],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id_producto: this.lastID, nombre, precio, stock, id_categoria, estado: 1 });
      }
    );
  });
}

function updateProducto(id_producto, { nombre, precio, stock, id_categoria }) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE producto SET nombre = ?, precio = ?, stock = ?, id_categoria = ?, updated_at = datetime('now') WHERE id_producto = ?",
      [nombre, precio, stock, id_categoria, id_producto],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

function softDeleteProducto(id_producto) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE producto SET estado = 0, updated_at = datetime('now') WHERE id_producto = ?",
      [id_producto],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

module.exports = { listProductos, createProducto, updateProducto, softDeleteProducto };
