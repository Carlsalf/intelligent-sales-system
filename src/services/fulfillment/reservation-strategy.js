const {
  FULFILLMENT_TYPE,
  validateRequestedQuantity,
} = require("./business-rules");

function applyReservationStrategy({
  requestedQuantity,
  availableStock,
}) {
  const requested = validateRequestedQuantity(requestedQuantity);
  const available = Math.max(Number(availableStock) || 0, 0);
  const reservedQuantity = Math.min(requested, available);

  return {
    fulfillmentType: FULFILLMENT_TYPE.RESERVED,
    reservedQuantity,
    committedQuantity: 0,
  };
}

module.exports = {
  applyReservationStrategy,
};
