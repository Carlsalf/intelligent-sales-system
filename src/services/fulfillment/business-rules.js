const FULFILLMENT_TYPE = Object.freeze({
  RESERVED: "RESERVED",
  COMMITTED: "COMMITTED",
  MIXED: "MIXED",
});

const ORDER_STATUS = Object.freeze({
  REGISTERED: "REGISTRADO",
  CONFIRMED: "CONFIRMADO",
  PREPARING: "EN_PREPARACION",
  READY_FOR_PICKUP: "LISTO_PARA_RECOJO",
  DELIVERED: "ENTREGADO",
  CANCELLED: "CANCELADO",
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDIENTE",
  APPROVED: "APROBADO",
  REJECTED: "RECHAZADO",
  REFUNDED: "REEMBOLSADO",
  SIMULATED_APPROVED: "SIMULADO_PAGADO",
});

function toNonNegativeInteger(value, fieldName) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${fieldName} debe ser un número entero igual o mayor que cero.`);
  }

  return number;
}

function calculateAvailableStock({
  physicalStock,
  reservedStock = 0,
}) {
  const physical = toNonNegativeInteger(physicalStock, "physicalStock");
  const reserved = toNonNegativeInteger(reservedStock, "reservedStock");

  return Math.max(physical - reserved, 0);
}

function validateRequestedQuantity(quantity) {
  const parsed = Number(quantity);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("La cantidad solicitada debe ser un número entero mayor que cero.");
  }

  return parsed;
}

function validateApprovedPayment(paymentStatus) {
  const approvedStatuses = [
    PAYMENT_STATUS.APPROVED,
    PAYMENT_STATUS.SIMULATED_APPROVED,
  ];

  if (!approvedStatuses.includes(paymentStatus)) {
    throw new Error("El pedido no puede procesarse porque el pago no está aprobado.");
  }

  return true;
}

module.exports = {
  FULFILLMENT_TYPE,
  ORDER_STATUS,
  PAYMENT_STATUS,
  calculateAvailableStock,
  validateRequestedQuantity,
  validateApprovedPayment,
};
