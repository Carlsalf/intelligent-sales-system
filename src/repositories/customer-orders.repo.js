const { getDb } = require("../db/connection");

function listCustomerOrders(id_cliente) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        v.id_venta,
        v.id_cliente,
        v.id_cliente_cuenta,
        v.fecha,
        v.total,
        v.estado_pedido,
        v.tipo_entrega,
        v.pago_estado,
        v.fecha_entrega_estimada,
        v.canal_venta,
        COUNT(dv.id_detalle) AS cantidad_items,
        COALESCE(SUM(dv.cantidad), 0) AS total_unidades
      FROM venta v
      LEFT JOIN detalle_venta dv
        ON dv.id_venta = v.id_venta
      WHERE v.id_cliente = ?
        AND v.canal_venta IN (
          'ECOMMERCE_WEB',
          'ECOMMERCE_MOBILE'
        )
      GROUP BY v.id_venta
      ORDER BY v.id_venta DESC
      `,
      [id_cliente],
      (error, rows) => {
        db.close();

        if (error) {
          return reject(error);
        }

        resolve(rows || []);
      }
    );
  });
}

function getCustomerOrderById(
  id_cliente,
  id_venta
) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        v.id_venta,
        v.id_cliente,
        v.id_cliente_cuenta,
        v.fecha,
        v.total,
        v.estado_pedido,
        v.tipo_entrega,
        v.pago_estado,
        v.fecha_entrega_estimada,
        v.canal_venta,
        v.direccion_entrega_snapshot,
        v.id_direccion_entrega
      FROM venta v
      WHERE v.id_venta = ?
        AND v.id_cliente = ?
        AND v.canal_venta IN (
          'ECOMMERCE_WEB',
          'ECOMMERCE_MOBILE'
        )
      LIMIT 1
      `,
      [id_venta, id_cliente],
      (orderError, order) => {
        if (orderError) {
          db.close();
          return reject(orderError);
        }

        if (!order) {
          db.close();
          return resolve(null);
        }

        db.all(
          `
          SELECT
            dv.id_detalle,
            dv.id_producto,
            p.nombre AS producto_nombre,
            dv.cantidad,
            dv.precio_unitario,
            dv.subtotal,
            dv.tipo_cumplimiento,
            dv.cantidad_reservada,
            dv.cantidad_comprometida,
            dv.fecha_disponibilidad_estimada
          FROM detalle_venta dv
          LEFT JOIN producto p
            ON p.id_producto = dv.id_producto
          WHERE dv.id_venta = ?
          ORDER BY dv.id_detalle ASC
          `,
          [id_venta],
          (detailError, items) => {
            db.close();

            if (detailError) {
              return reject(detailError);
            }

            resolve({
              ...order,
              items: items || [],
            });
          }
        );
      }
    );
  });
}

module.exports = {
  listCustomerOrders,
  getCustomerOrderById,
};
