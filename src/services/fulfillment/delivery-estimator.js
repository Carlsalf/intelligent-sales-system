const DEFAULT_PREPARATION_DAYS = 1;

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toNonNegativeIntegerOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function estimatePromisedAt({
  committedQuantity,
  preparationDays = DEFAULT_PREPARATION_DAYS,
  replenishmentDays = null,
  replenishmentConfirmed = false,
  baseDate = new Date(),
}) {
  const committed = Number(committedQuantity);

  if (!Number.isInteger(committed) || committed < 0) {
    throw new Error(
      "committedQuantity debe ser un entero no negativo."
    );
  }

  const preparation =
    toNonNegativeIntegerOrNull(preparationDays) ??
    DEFAULT_PREPARATION_DAYS;

  // Todo el pedido puede cubrirse con stock disponible.
  if (committed === 0) {
    return addDays(
      baseDate,
      preparation
    ).toISOString();
  }

  // Existe cantidad comprometida pero el abastecimiento
  // todavía no está confirmado: no debe prometerse fecha.
  if (!replenishmentConfirmed) {
    return null;
  }

  const replenishment =
    toNonNegativeIntegerOrNull(replenishmentDays);

  // Aunque exista una marca de reposición confirmada,
  // necesitamos conocer el plazo para calcular una fecha.
  if (replenishment === null) {
    return null;
  }

  return addDays(
    baseDate,
    replenishment + preparation
  ).toISOString();
}

module.exports = {
  DEFAULT_PREPARATION_DAYS,
  estimatePromisedAt,
};
