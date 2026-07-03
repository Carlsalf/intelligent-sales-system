const { getDb } = require("../db/connection");

function mapProduct(row) {
  if (!row) return null;

  return {
    id: row.id_producto,
    id_producto: row.id_producto,
    nombre: row.nombre,
    precio: Number(row.precio),
    stock: Number(row.stock),
    stock_fisico: Number(row.stock || 0),
    stock_reservado: Number(row.stock_reservado || 0),
    stock_comprometido: Number(row.stock_comprometido || 0),
    stock_disponible: Math.max(Number(row.stock || 0) - Number(row.stock_reservado || 0), 0),
    id_categoria: row.id_categoria,
    categoria: row.categoria_nombre,
    categoria_nombre: row.categoria_nombre,
    estado: row.estado,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function listProductos() {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.stock,
        p.stock_reservado,
        p.stock_comprometido,
        p.id_categoria,
        c.nombre AS categoria_nombre,
        p.estado,
        p.created_at,
        p.updated_at
      FROM producto p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      WHERE p.estado = 1
      ORDER BY p.id_producto DESC
      `,
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve((rows || []).map(mapProduct));
      }
    );
  });
}

function getProductoById(id_producto) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.stock,
        p.stock_reservado,
        p.stock_comprometido,
        p.id_categoria,
        c.nombre AS categoria_nombre,
        p.estado,
        p.created_at,
        p.updated_at
      FROM producto p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      WHERE p.id_producto = ?
      `,
      [id_producto],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(mapProduct(row));
      }
    );
  });
}

function findCategoriaByName(nombre) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id_categoria, nombre FROM categoria WHERE LOWER(nombre) = LOWER(?) LIMIT 1`,
      [nombre],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function createProducto({ nombre, precio, stock, id_categoria }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO producto(nombre, precio, stock, id_categoria, estado, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `,
      [nombre, precio, stock, id_categoria],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id_producto: this.lastID });
      }
    );
  });
}

function updateProducto(id_producto, { nombre, precio, stock, id_categoria }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE producto
      SET nombre = ?, precio = ?, stock = ?, id_categoria = ?, updated_at = datetime('now')
      WHERE id_producto = ? AND estado = 1
      `,
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
      `
      UPDATE producto
      SET estado = 0, updated_at = datetime('now')
      WHERE id_producto = ?
      `,
      [id_producto],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

module.exports = {
  listProductos,
  getProductoById,
  findCategoriaByName,
  createProducto,
  updateProducto,
  softDeleteProducto,
};
