require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getDb } = require("./connection");

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

(async () => {
  const db = getDb();

  try {
    const password = "Admin123*"; // luego lo cambias
    const hash = await bcrypt.hash(password, 10);

    await run(
      db,
      "INSERT OR IGNORE INTO usuario(nombre,email,password_hash,id_rol,estado) VALUES (?,?,?,?,1);",
      ["Admin", "admin@pyme.com", hash, 1]
    );

    console.log("✅ Admin creado/confirmado -> admin@pyme.com / Admin123*");
  } catch (err) {
    console.error("❌ Error seed admin:", err);
    process.exit(1);
  } finally {
    db.close();
  }
})();
