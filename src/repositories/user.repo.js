const { getDb } = require("../db/connection");

function getUserByEmail(email) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT u.id_usuario,u.nombre,u.email,u.password_hash,u.id_rol,
              r.nombre AS rol,u.estado
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol=u.id_rol
       WHERE u.email=?`,
      [email],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function getUserById(id_usuario) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT u.id_usuario,u.nombre,u.email,u.id_rol,
              r.nombre AS rol,u.estado
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol=u.id_rol
       WHERE u.id_usuario=?`,
      [id_usuario],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

module.exports = { getUserByEmail, getUserById };
