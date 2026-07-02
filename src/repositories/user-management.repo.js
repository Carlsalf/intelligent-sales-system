const { getDb } = require("../db/connection");

function listUsers() {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.id_rol,
        r.nombre AS rol,
        u.estado,
        u.created_at,
        u.updated_at
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol = u.id_rol
       ORDER BY u.id_usuario DESC`,
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function listRoles() {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id_rol, nombre FROM rol ORDER BY id_rol",
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function getUserByEmail(email) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id_usuario FROM usuario WHERE lower(email) = lower(?)",
      [email],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function createUser({ nombre, email, password_hash, id_rol }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO usuario(nombre,email,password_hash,id_rol,estado)
       VALUES(?,?,?,?,1)`,
      [nombre, email, password_hash, id_rol],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({
          id_usuario: this.lastID,
          nombre,
          email,
          id_rol,
          estado: 1,
        });
      }
    );
  });
}

function updateUserStatus(id_usuario, estado) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE usuario 
       SET estado = ?, updated_at = datetime('now')
       WHERE id_usuario = ?`,
      [estado, id_usuario],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ id_usuario, estado, changed: this.changes });
      }
    );
  });
}

module.exports = {
  listUsers,
  listRoles,
  getUserByEmail,
  createUser,
  updateUserStatus,
};
