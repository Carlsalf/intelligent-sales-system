const { getDb } = require("../db/connection");

function getUserByEmail(email) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id_usuario, nombre, email, password_hash, id_rol, estado FROM usuario WHERE email = ?",
      [email],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

module.exports = { getUserByEmail };
