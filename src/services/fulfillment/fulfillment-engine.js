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

const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE: "DISPONIBLE",
  COMMITTED: "COMPROMETIDO",
  PENDING_REPLENISHMENT: "PENDIENTE_REPOSICION",
});

function buildFulfillmentPlan({
  requestedQuantity,
  physicalStock,
  reservedStock = 0,
  paymentStatus,
  preparationDays = 1,
  replenishmentDays = null,
  replenishmentConfirmed = false,
  baseDate = new Date(),
}) {
  validateApprovedPayment(paymentStatus);

  const requested =
    validateRequestedQuantity(requestedQuantity);

  const availableStock =
    calculateAvailableStock({
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

  const needsReplenishment =
    strategyResult.committedQuantity > 0;

  const confirmedReplenishment =
    Number(replenishmentConfirmed) === 1 ||
    replenishmentConfirmed === true;

  let availabilityStatus;

  if (!needsReplenishment) {
    availabilityStatus =
      AVAILABILITY_STATUS.AVAILABLE;
  } else if (
    confirmedReplenishment &&
    replenishmentDays !== null &&
    replenishmentDays !== undefined
  ) {
    availabilityStatus =
      AVAILABILITY_STATUS.COMMITTED;
  } else {
    availabilityStatus =
      AVAILABILITY_STATUS.PENDING_REPLENISHMENT;
  }

  const promisedAt = estimatePromisedAt({
    committedQuantity:
      strategyResult.committedQuantity,
    preparationDays,
    replenishmentDays,
    replenishmentConfirmed:
      confirmedReplenishment,
    baseDate,
  });

  return {
    requestedQuantity: requested,
    availableStockBeforeOperation:
      availableStock,
    ...strategyResult,
    availabilityStatus,
    replenishmentConfirmed:
      confirmedReplenishment,
    replenishmentDays:
      replenishmentDays ?? null,
    promisedAt,
  };
}

module.exports = {
  AVAILABILITY_STATUS,
  buildFulfillmentPlan,
};
