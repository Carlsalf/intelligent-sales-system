const { getDb } = require("../db/connection");

function allCategorias() {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id_categoria, nombre, estado, created_at, updated_at FROM categoria WHERE estado = 1 ORDER BY nombre ASC",
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function createCategoria(nombre) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO categoria(nombre, estado) VALUES (?, 1)",
      [nombre],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id_categoria: this.lastID, nombre, estado: 1 });
      }
    );
  });
}

function updateCategoria(id, nombre) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE categoria SET nombre = ?, updated_at = datetime('now') WHERE id_categoria = ?",
      [nombre, id],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

function softDeleteCategoria(id) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE categoria SET estado = 0, updated_at = datetime('now') WHERE id_categoria = ?",
      [id],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

module.exports = {
  allCategorias,
  createCategoria,
  updateCategoria,
  softDeleteCategoria,
};
