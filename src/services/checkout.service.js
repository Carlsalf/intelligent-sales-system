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

const SALES_CHANNELS = Object.freeze({
  BACKOFFICE: "BACKOFFICE",
  ECOMMERCE_WEB: "ECOMMERCE_WEB",
  ECOMMERCE_MOBILE: "ECOMMERCE_MOBILE",
});

function createHttpError(message, status, code) {
  const error = new Error(message);
  error.status = status;

  if (code) {
    error.code = code;
  }

  return error;
}

function positiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createHttpError(
      `${fieldName} debe ser un entero mayor que cero.`,
      400,
      "INVALID_POSITIVE_INTEGER"
    );
  }

  return parsed;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateDeliveryType(value) {
  const deliveryType = value || DELIVERY_TYPES.PICKUP;

  if (!Object.values(DELIVERY_TYPES).includes(deliveryType)) {
    throw createHttpError(
      "tipo_entrega debe ser RECOJO_ALMACEN o ENTREGA_DOMICILIO.",
      400,
      "INVALID_DELIVERY_TYPE"
    );
  }

  return deliveryType;
}

function validateSalesChannel(value) {
  const channel = value || SALES_CHANNELS.BACKOFFICE;

  if (!Object.values(SALES_CHANNELS).includes(channel)) {
    throw createHttpError(
      "Canal de venta inválido.",
      400,
      "INVALID_SALES_CHANNEL"
    );
  }

  return channel;
}

function buildDeliverySnapshot(deliveryType, rawAddress) {
  if (deliveryType === DELIVERY_TYPES.PICKUP) {
    return null;
  }

  const address = rawAddress || {};

  const snapshot = {
    destinatario: normalizeText(address.destinatario),
    telefono: normalizeText(address.telefono),
    direccion_linea_1: normalizeText(address.direccion_linea_1),
    direccion_linea_2: normalizeText(address.direccion_linea_2) || null,
    ciudad: normalizeText(address.ciudad),
    provincia: normalizeText(address.provincia),
    codigo_postal: normalizeText(address.codigo_postal),
    pais: normalizeText(address.pais) || "España",
    referencia: normalizeText(address.referencia) || null,
  };

  const requiredFields = [
    "destinatario",
    "telefono",
    "direccion_linea_1",
    "ciudad",
    "provincia",
    "codigo_postal",
  ];

  const missing = requiredFields.filter(
    (field) => !snapshot[field]
  );

  if (missing.length) {
    throw createHttpError(
      `Faltan datos obligatorios de entrega: ${missing.join(", ")}.`,
      400,
      "INCOMPLETE_DELIVERY_ADDRESS"
    );
  }

  return JSON.stringify(snapshot);
}

function latestPromisedAt(items) {
  return items.reduce((latest, item) => {
    if (!latest) {
      return item.promisedAt;
    }

    return new Date(item.promisedAt) > new Date(latest)
      ? item.promisedAt
      : latest;
  }, null);
}

async function executeCheckout({
  id_cliente,
  id_cliente_cuenta = null,
  id_usuario,
  body = {},
  canal_venta,
}) {
  const clientId = positiveInteger(id_cliente, "id_cliente");
  const userId = positiveInteger(id_usuario, "id_usuario");

  const customerAccountId =
    id_cliente_cuenta === null
      ? null
      : positiveInteger(
          id_cliente_cuenta,
          "id_cliente_cuenta"
        );

  const deliveryType = validateDeliveryType(
    body.tipo_entrega
  );

  const salesChannel = validateSalesChannel(canal_venta);

  const deliverySnapshot = buildDeliverySnapshot(
    deliveryType,
    body.direccion_entrega
  );

  const paymentStatus =
    PAYMENT_STATUS.SIMULATED_APPROVED;

  const cart = await repository.getOpenCartSnapshot(
    clientId
  );

  if (!cart) {
    throw createHttpError(
      "El cliente no tiene un carrito abierto.",
      404,
      "OPEN_CART_NOT_FOUND"
    );
  }

  if (!cart.items.length) {
    throw createHttpError(
      "El carrito está vacío.",
      409,
      "EMPTY_CART"
    );
  }

  const plannedItems = cart.items.map((item) => {
    const quantity = positiveInteger(
      item.cantidad,
      "cantidad"
    );

    const plan = buildFulfillmentPlan({
      requestedQuantity: quantity,
      physicalStock: Number(item.stock || 0),
      reservedStock: Number(
        item.stock_reservado || 0
      ),
      paymentStatus,
      baseDate: new Date(),
    });

    const unitPrice = Number(item.precio || 0);

    const subtotal = Number(
      (unitPrice * quantity).toFixed(2)
    );

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
      .reduce(
        (sum, item) =>
          sum + Number(item.subtotal || 0),
        0
      )
      .toFixed(2)
  );

  const promisedAt = latestPromisedAt(
    plannedItems
  );

  const result = await repository.persistCheckout({
    id_carrito: cart.id_carrito,
    id_cliente: clientId,
    id_cliente_cuenta: customerAccountId,
    id_usuario: userId,
    canal_venta: salesChannel,
    direccion_entrega_snapshot:
      deliverySnapshot,
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
      codigo: `ISS-${String(
        result.id_venta
      ).padStart(6, "0")}`,
      estado: "CONFIRMADO",
      estado_visible: "PEDIDO_CONFIRMADO",
      pago_estado: result.pago_estado,
      tipo_entrega: result.tipo_entrega,
      canal_venta: result.canal_venta,
      total: result.total,
      fecha_entrega_estimada:
        result.fecha_entrega_estimada,
    },
  };
}

async function checkout(
  id_cliente,
  body,
  user
) {
  return executeCheckout({
    id_cliente,
    id_usuario: user?.id_usuario,
    body,
    canal_venta: SALES_CHANNELS.BACKOFFICE,
  });
}

async function checkoutCustomer(
  customer,
  body = {}
) {
  const technicalUserId = positiveInteger(
    process.env.ECOMMERCE_SYSTEM_USER_ID,
    "ECOMMERCE_SYSTEM_USER_ID"
  );

  return executeCheckout({
    id_cliente: customer?.id_cliente,
    id_cliente_cuenta:
      customer?.id_cliente_cuenta,
    id_usuario: technicalUserId,
    body,
    canal_venta:
      body.canal_venta ===
      SALES_CHANNELS.ECOMMERCE_MOBILE
        ? SALES_CHANNELS.ECOMMERCE_MOBILE
        : SALES_CHANNELS.ECOMMERCE_WEB,
  });
}

module.exports = {
  checkout,
  checkoutCustomer,
  DELIVERY_TYPES,
  SALES_CHANNELS,
};
