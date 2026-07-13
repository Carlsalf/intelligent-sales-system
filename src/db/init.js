const { getDb } = require("./connection");

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function tableInfo(db, table) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function ensureColumn(db, table, column, definition) {
  const columns = await tableInfo(db, table);
  const exists = columns.some((c) => c.name === column);

  if (!exists) {
    await run(db, `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
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

  // Migraciones inventario: reserva y compromiso de stock
  await ensureColumn(db, "producto", "stock_reservado", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "producto", "stock_comprometido", "INTEGER NOT NULL DEFAULT 0");

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

  //   // Cuenta digital del cliente eCommerce
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS cliente_cuenta (" +
      "id_cliente_cuenta INTEGER PRIMARY KEY AUTOINCREMENT," +
      "id_cliente INTEGER NOT NULL UNIQUE," +
      "email TEXT NOT NULL COLLATE NOCASE UNIQUE," +
      "password_hash TEXT NOT NULL," +
      "estado INTEGER NOT NULL DEFAULT 1 CHECK (estado IN (0, 1))," +
      "email_verificado INTEGER NOT NULL DEFAULT 0 CHECK (email_verificado IN (0, 1))," +
      "ultimo_acceso TEXT," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)" +
    ");"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_cliente_cuenta_cliente " +
    "ON cliente_cuenta(id_cliente);"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_cliente_cuenta_email " +
    "ON cliente_cuenta(email);"
  );

  // Direcciones del cliente eCommerce
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS cliente_direccion (" +
      "id_direccion INTEGER PRIMARY KEY AUTOINCREMENT," +
      "id_cliente INTEGER NOT NULL," +
      "alias TEXT NOT NULL DEFAULT 'Principal'," +
      "destinatario TEXT NOT NULL," +
      "telefono TEXT NOT NULL," +
      "direccion_linea_1 TEXT NOT NULL," +
      "direccion_linea_2 TEXT," +
      "ciudad TEXT NOT NULL," +
      "provincia TEXT NOT NULL," +
      "codigo_postal TEXT NOT NULL," +
      "pais TEXT NOT NULL DEFAULT 'España'," +
      "referencia TEXT," +
      "es_principal INTEGER NOT NULL DEFAULT 0 CHECK (es_principal IN (0,1))," +
      "estado INTEGER NOT NULL DEFAULT 1 CHECK (estado IN (0,1))," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)" +
    ");"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_cliente_direccion_cliente " +
    "ON cliente_direccion(id_cliente);"
  );

  await run(
    db,
    "CREATE UNIQUE INDEX IF NOT EXISTS uq_cliente_direccion_principal " +
    "ON cliente_direccion(id_cliente) " +
    "WHERE es_principal = 1 AND estado = 1;"
  );

// Carrito de compras


  await run(
    db,
    "CREATE TABLE IF NOT EXISTS carrito (" +
      "id_carrito INTEGER PRIMARY KEY AUTOINCREMENT," +
      "id_cliente INTEGER NOT NULL," +
      "estado TEXT NOT NULL DEFAULT 'ABIERTO'," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "converted_at TEXT," +
    
  "FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)" +
    ");"
  );

  // Un cliente solo puede mantener un carrito abierto
  await run(
    db,
    "CREATE UNIQUE INDEX IF NOT EXISTS uq_carrito_cliente_abierto " +
    "ON carrito(id_cliente) WHERE estado = 'ABIERTO';"
  );

  // Detalle del carrito
  await run(
    db,
    "CREATE TABLE IF NOT EXISTS detalle_carrito (" +
      "id_detalle_carrito INTEGER PRIMARY KEY AUTOINCREMENT," +
      "id_carrito INTEGER NOT NULL," +
      "id_producto INTEGER NOT NULL," +
      "cantidad INTEGER NOT NULL CHECK (cantidad > 0)," +
      "created_at TEXT DEFAULT (datetime('now'))," +
      "updated_at TEXT DEFAULT (datetime('now'))," +
      "FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito)," +
      "FOREIGN KEY (id_producto) REFERENCES producto(id_producto)," +
      "UNIQUE (id_carrito, id_producto)" +
    ");"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_detalle_carrito_carrito " +
    "ON detalle_carrito(id_carrito);"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_detalle_carrito_producto " +
    "ON detalle_carrito(id_producto);"
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

  // Migraciones venta/pedido: estado, entrega y pago simulado
  await ensureColumn(db, "venta", "estado_pedido", "TEXT NOT NULL DEFAULT 'REGISTRADO'");
  await ensureColumn(db, "venta", "tipo_entrega", "TEXT NOT NULL DEFAULT 'RECOJO_ALMACEN'");
  await ensureColumn(db, "venta", "fecha_entrega_estimada", "TEXT");
  await ensureColumn(db, "venta", "pago_estado", "TEXT NOT NULL DEFAULT 'SIMULADO_PAGADO'");

  await ensureColumn(
    db,
    "venta",
    "id_cliente_cuenta",
    "INTEGER"
  );

  await ensureColumn(
    db,
    "venta",
    "canal_venta",
    "TEXT NOT NULL DEFAULT 'BACKOFFICE'"
  );

  await ensureColumn(
    db,
    "venta",
    "direccion_entrega_snapshot",
    "TEXT"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_venta_cliente_cuenta " +
    "ON venta(id_cliente_cuenta);"
  );

  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_venta_canal " +
    "ON venta(canal_venta);"
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

  // Migraciones detalle_venta: cumplimiento por línea
  await ensureColumn(
    db,
    "detalle_venta",
    "tipo_cumplimiento",
    "TEXT NOT NULL DEFAULT 'RESERVED'"
  );

  await ensureColumn(
    db,
    "detalle_venta",
    "cantidad_reservada",
    "INTEGER NOT NULL DEFAULT 0"
  );

  await ensureColumn(
    db,
    "detalle_venta",
    "cantidad_comprometida",
    "INTEGER NOT NULL DEFAULT 0"
  );

  await ensureColumn(
    db,
    "detalle_venta",
    "fecha_disponibilidad_estimada",
    "TEXT"
  );

  // Seeds roles
  await run(db, "INSERT OR IGNORE INTO rol(nombre) VALUES ('admin'), ('vendedor');");

  db.close();
}

module.exports = { initDb };
