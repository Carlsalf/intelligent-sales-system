const { getDb } = require("../db/connection");

function listClientes() {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id_cliente, nombre, documento, telefono, email, estado, created_at, updated_at FROM cliente WHERE estado = 1 ORDER BY nombre ASC",
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function createCliente({ nombre, documento, telefono, email }) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO cliente(nombre, documento, telefono, email, estado) VALUES (?, ?, ?, ?, 1)",
      [nombre, documento || null, telefono || null, email || null],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id_cliente: this.lastID, nombre, documento, telefono, email, estado: 1 });
      }
    );
  });
}

module.exports = { listClientes, createCliente };
