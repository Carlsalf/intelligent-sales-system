const { getDb } = require("../db/connection");

function mapCliente(row) {
  return {
    id: row.id_cliente,
    id_cliente: row.id_cliente,
    nombre: row.nombre,
    documento: row.documento,
    telefono: row.telefono,
    email: row.email,
    estado: row.estado,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function listClientes() {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id_cliente, nombre, documento, telefono, email, estado, created_at, updated_at
       FROM cliente
       ORDER BY estado DESC, id_cliente DESC`,
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve((rows || []).map(mapCliente));
      }
    );
  });
}

function getClienteById(id_cliente) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id_cliente, nombre, documento, telefono, email, estado, created_at, updated_at
       FROM cliente
       WHERE id_cliente = ? AND estado = 1`,
      [id_cliente],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row ? mapCliente(row) : null);
      }
    );
  });
}

function createCliente({ nombre, documento, telefono, email }) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO cliente(nombre, documento, telefono, email, estado, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [nombre, documento || null, telefono || null, email || null],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id_cliente: this.lastID });
      }
    );
  });
}

function updateCliente(id_cliente, { nombre, documento, telefono, email }) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE cliente
       SET nombre = ?, documento = ?, telefono = ?, email = ?, updated_at = datetime('now')
       WHERE id_cliente = ? AND estado = 1`,
      [nombre, documento || null, telefono || null, email || null, id_cliente],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

function softDeleteCliente(id_cliente) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE cliente
       SET estado = 0, updated_at = datetime('now')
       WHERE id_cliente = ? AND estado = 1`,
      [id_cliente],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}


function reactivateCliente(id_cliente) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE cliente
       SET estado = 1, updated_at = datetime('now')
       WHERE id_cliente = ? AND estado = 0`,
      [id_cliente],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

module.exports = {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  softDeleteCliente,
  reactivateCliente,
};
