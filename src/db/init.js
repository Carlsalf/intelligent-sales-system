const { getDb } = require("./connection");

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function initDb() {
  const db = getDb();

  // Rol
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS rol (" +
      "id_rol INTEGER PRIMARY KEY AUTOINCREMENT," +
      "nombre TEXT NOT NULL UNIQUE" +
    ");"
  );

  // Usuario
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS usuario (" +
      "id_usuario INTEGER PRIMARY KEY AUTOINCREMENT," +
      "nombre TEXT NOT NULL," +
      "email TEXT NOT NULL UNIQUE," +
      "password_hash TEXT NOT NULL," +
      "id_rol INTEGER NOT NULL," +
      "estado INTEGER NOT NULL DEFAULT 1," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_rol) REFERENCES rol(id_rol)" +
    ");"
  );

  // Categoria
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS categoria (" +
      "id_categoria INTEGER PRIMARY KEY AUTOINCREMENT," +
      "nombre TEXT NOT NULL UNIQUE," +
      "estado INTEGER NOT NULL DEFAULT 1," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))" +
    ");"
  );

  // Producto
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS producto (" +
      "id_producto INTEGER PRIMARY KEY AUTOINCREMENT," +
      "nombre TEXT NOT NULL," +
      "precio REAL NOT NULL," +
      "stock INTEGER NOT NULL DEFAULT 0," +
      "id_categoria INTEGER NOT NULL," +
      "estado INTEGER NOT NULL DEFAULT 1," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)" +
    ");"
  );

  // Cliente
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS cliente (" +
      "id_cliente INTEGER PRIMARY KEY AUTOINCREMENT," +
      "nombre TEXT NOT NULL," +
      "documento TEXT," +
      "telefono TEXT," +
      "email TEXT," +
      "estado INTEGER NOT NULL DEFAULT 1," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))" +
    ");"
  );

  // Venta (cabecera)
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS venta (" +
      "id_venta INTEGER PRIMARY KEY AUTOINCREMENT," +
      "id_cliente INTEGER," +
      "id_usuario INTEGER NOT NULL," +
      "fecha TEXT NOT NULL DEFAULT (datetime('now'))," +
      "total REAL NOT NULL DEFAULT 0," +
      "estado INTEGER NOT NULL DEFAULT 1," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)," +
      "FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)" +
    ");"
  );

  // Detalle venta
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS detalle_venta (" +
      "id_detalle INTEGER PRIMARY KEY AUTOINCREMENT," +
      "id_venta INTEGER NOT NULL," +
      "id_producto INTEGER NOT NULL," +
      "cantidad INTEGER NOT NULL," +
      "precio_unitario REAL NOT NULL," +
      "subtotal REAL NOT NULL," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_venta) REFERENCES venta(id_venta)," +
      "FOREIGN KEY (id_producto) REFERENCES producto(id_producto)" +
    ");"
  );

  // Seeds roles
  await run(db, "INSERT OR IGNORE INTO rol(nombre) VALUES ('admin'), ('vendedor');");

  db.close();
}

module.exports = { initDb };
