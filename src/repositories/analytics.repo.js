const { getDb } = require("../db/connection");

function all(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function get(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

async function getResumenGeneral() {
  return get(`
    SELECT
      COUNT(*) AS ventas_analizadas,
      ROUND(SUM(total), 2) AS facturacion_acumulada,
      ROUND(AVG(total), 2) AS ticket_medio
    FROM venta
    WHERE estado = 1
  `);
}

async function getVentasPorMes() {
  return all(`
    SELECT
      strftime('%Y-%m', fecha) AS mes,
      COUNT(*) AS ventas,
      ROUND(SUM(total), 2) AS facturacion
    FROM venta
    WHERE estado = 1
    GROUP BY strftime('%Y-%m', fecha)
    ORDER BY mes ASC
  `);
}

async function getTopProductos() {
  return all(`
    SELECT
      p.nombre AS producto,
      SUM(dv.cantidad) AS unidades,
      ROUND(SUM(dv.subtotal), 2) AS facturacion
    FROM detalle_venta dv
    JOIN venta v ON v.id_venta = dv.id_venta
    JOIN producto p ON p.id_producto = dv.id_producto
    WHERE v.estado = 1
    GROUP BY p.id_producto
    ORDER BY unidades DESC
    LIMIT 5
  `);
}

async function getTopClientes() {
  return all(`
    SELECT
      COALESCE(c.nombre, 'Venta sin cliente asociado') AS cliente,
      COUNT(v.id_venta) AS ventas,
      ROUND(SUM(v.total), 2) AS facturacion
    FROM venta v
    LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
    WHERE v.estado = 1
    GROUP BY v.id_cliente
    ORDER BY facturacion DESC
    LIMIT 5
  `);
}

module.exports = {
  getResumenGeneral,
  getVentasPorMes,
  getTopProductos,
  getTopClientes,
};
