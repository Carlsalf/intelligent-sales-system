const repository = require("../repositories/checkout.repo");
const {
  buildFulfillmentPlan,
} = require("./fulfillment/fulfillment-engine");
const {
  PAYMENT_STATUS,
} = require("./fulfillment/business-rules");

const DELIVERY_TYPES = Object.freeze({
  PICKUP: "RECOJO_ALMACEN",
  DELIVERY: "ENTREGA_DOMICILIO",
});

function positiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} debe ser un entero mayor que cero.`);
    error.status = 400;
    throw error;
  }

  return parsed;
}

function validateDeliveryType(value) {
  const deliveryType = value || DELIVERY_TYPES.PICKUP;

  if (!Object.values(DELIVERY_TYPES).includes(deliveryType)) {
    const error = new Error(
      "tipo_entrega debe ser RECOJO_ALMACEN o ENTREGA_DOMICILIO."
    );
    error.status = 400;
    throw error;
  }

  return deliveryType;
}

function latestPromisedAt(items) {
  return items.reduce((latest, item) => {
    if (!latest) return item.promisedAt;

    return new Date(item.promisedAt) > new Date(latest)
      ? item.promisedAt
      : latest;
  }, null);
}

async function checkout(id_cliente, body, user) {
  const clientId = positiveInteger(id_cliente, "id_cliente");
  const userId = positiveInteger(user?.id_usuario, "id_usuario");
  const deliveryType = validateDeliveryType(body?.tipo_entrega);
  const paymentStatus = PAYMENT_STATUS.SIMULATED_APPROVED;

  const cart = await repository.getOpenCartSnapshot(clientId);

  if (!cart) {
    const error = new Error("El cliente no tiene un carrito abierto.");
    error.status = 404;
    throw error;
  }

  if (!cart.items.length) {
    const error = new Error("El carrito está vacío.");
    error.status = 409;
    throw error;
  }

  const plannedItems = cart.items.map((item) => {
    const quantity = positiveInteger(item.cantidad, "cantidad");

    const plan = buildFulfillmentPlan({
      requestedQuantity: quantity,
      physicalStock: Number(item.stock || 0),
      reservedStock: Number(item.stock_reservado || 0),
      paymentStatus,
      baseDate: new Date(),
    });

    const unitPrice = Number(item.precio || 0);
    const subtotal = Number((unitPrice * quantity).toFixed(2));

    return {
      id_producto: Number(item.id_producto),
      producto_nombre: item.producto_nombre,
      cantidad: quantity,
      precio_unitario: unitPrice,
      subtotal,
      ...plan,
    };
  });

  const total = Number(
    plannedItems
      .reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
      .toFixed(2)
  );

  const promisedAt = latestPromisedAt(plannedItems);

  const result = await repository.persistCheckout({
    id_carrito: cart.id_carrito,
    id_cliente: clientId,
    id_usuario: userId,
    tipo_entrega: deliveryType,
    pago_estado: paymentStatus,
    total,
    fecha_entrega_estimada: promisedAt,
    items: plannedItems,
  });

  return {
    success: true,
    message:
      "Pago confirmado. Su pedido ha sido registrado y está siendo preparado.",
    pedido: {
      id_venta: result.id_venta,
      codigo: `ISS-${String(result.id_venta).padStart(6, "0")}`,
      estado: "CONFIRMADO",
      estado_visible: "PEDIDO_CONFIRMADO",
      pago_estado: result.pago_estado,
      tipo_entrega: result.tipo_entrega,
      total: result.total,
      fecha_entrega_estimada: result.fecha_entrega_estimada,
    },
  };
}

module.exports = {
  checkout,
  DELIVERY_TYPES,
};
