const {
  FULFILLMENT_TYPE,
  validateRequestedQuantity,
} = require("./business-rules");

function applyCommitmentStrategy({
  requestedQuantity,
  availableStock,
}) {
  const requested = validateRequestedQuantity(requestedQuantity);
  const available = Math.max(Number(availableStock) || 0, 0);

  const reservedQuantity = Math.min(requested, available);
  const committedQuantity = requested - reservedQuantity;

  return {
    fulfillmentType:
      reservedQuantity > 0
        ? FULFILLMENT_TYPE.MIXED
        : FULFILLMENT_TYPE.COMMITTED,
    reservedQuantity,
    committedQuantity,
  };
}

module.exports = {
  applyCommitmentStrategy,
};
