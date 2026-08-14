const repository = require(
  "../repositories/customer-orders.repo"
);

function createHttpError(
  message,
  status,
  code
) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function positiveInteger(
  value,
  fieldName
) {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    throw createHttpError(
      `${fieldName} inválido`,
      400,
      "INVALID_POSITIVE_INTEGER"
    );
  }

  return parsed;
}

function orderCode(idVenta) {
  return `ISS-${String(idVenta).padStart(
    6,
    "0"
  )}`;
}

function visibleStatus(status) {
  switch (status) {
    case "PENDIENTE_REPOSICION":
      return "Pendiente de disponibilidad";

    case "CONFIRMADO_CON_REPOSICION":
      return "Confirmado con reposición";

    case "EN_PREPARACION":
      return "En preparación";

    case "LISTO_PARA_RECOJO":
      return "Listo para recoger";

    case "ENTREGADO":
      return "Entregado";

    case "CANCELADO":
      return "Cancelado";

    case "CONFIRMADO":
    default:
      return "Confirmado";
  }
}

function parseAddressSnapshot(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeOrder(order) {
  return {
    ...order,
    codigo: orderCode(order.id_venta),
    total: Number(order.total || 0),
    cantidad_items: Number(
      order.cantidad_items || 0
    ),
    total_unidades: Number(
      order.total_unidades || 0
    ),
    estado_visible: visibleStatus(
      order.estado_pedido
    ),
  };
}

async function listOrders(customer) {
  const customerId = positiveInteger(
    customer?.id_cliente,
    "id_cliente"
  );

  const orders =
    await repository.listCustomerOrders(
      customerId
    );

  return orders.map(normalizeOrder);
}

async function getOrder(
  customer,
  id
) {
  const customerId = positiveInteger(
    customer?.id_cliente,
    "id_cliente"
  );

  const orderId = positiveInteger(
    id,
    "id_venta"
  );

  const order =
    await repository.getCustomerOrderById(
      customerId,
      orderId
    );

  if (!order) {
    throw createHttpError(
      "Pedido no encontrado",
      404,
      "CUSTOMER_ORDER_NOT_FOUND"
    );
  }

  const items = (order.items || []).map(
    (item) => ({
      ...item,
      cantidad: Number(
        item.cantidad || 0
      ),
      precio_unitario: Number(
        item.precio_unitario || 0
      ),
      subtotal: Number(
        item.subtotal || 0
      ),
      cantidad_reservada: Number(
        item.cantidad_reservada || 0
      ),
      cantidad_comprometida: Number(
        item.cantidad_comprometida || 0
      ),
    })
  );

  return {
    ...normalizeOrder({
      ...order,
      cantidad_items: items.length,
      total_unidades: items.reduce(
        (sum, item) =>
          sum + item.cantidad,
        0
      ),
    }),

    direccion_entrega:
      parseAddressSnapshot(
        order.direccion_entrega_snapshot
      ),

    items,
  };
}

module.exports = {
  listOrders,
  getOrder,
};
