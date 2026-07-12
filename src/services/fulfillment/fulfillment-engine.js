const {
  calculateAvailableStock,
  validateRequestedQuantity,
  validateApprovedPayment,
} = require("./business-rules");

const {
  applyReservationStrategy,
} = require("./reservation-strategy");

const {
  applyCommitmentStrategy,
} = require("./commitment-strategy");

const {
  estimatePromisedAt,
} = require("./delivery-estimator");

function buildFulfillmentPlan({
  requestedQuantity,
  physicalStock,
  reservedStock = 0,
  paymentStatus,
  baseDate = new Date(),
}) {
  validateApprovedPayment(paymentStatus);

  const requested = validateRequestedQuantity(requestedQuantity);

  const availableStock = calculateAvailableStock({
    physicalStock,
    reservedStock,
  });

  const strategyResult =
    availableStock >= requested
      ? applyReservationStrategy({
          requestedQuantity: requested,
          availableStock,
        })
      : applyCommitmentStrategy({
          requestedQuantity: requested,
          availableStock,
        });

  const promisedAt = estimatePromisedAt({
    reservedQuantity: strategyResult.reservedQuantity,
    committedQuantity: strategyResult.committedQuantity,
    baseDate,
  });

  return {
    requestedQuantity: requested,
    availableStockBeforeOperation: availableStock,
    ...strategyResult,
    promisedAt,
  };
}

module.exports = {
  buildFulfillmentPlan,
};
