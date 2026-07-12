const DEFAULT_RESERVED_HOURS = 2;
const DEFAULT_COMMITTED_HOURS = 48;

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function estimatePromisedAt({
  reservedQuantity,
  committedQuantity,
  baseDate = new Date(),
}) {
  const reserved = Number(reservedQuantity);
  const committed = Number(committedQuantity);

  if (
    !Number.isInteger(reserved) ||
    reserved < 0 ||
    !Number.isInteger(committed) ||
    committed < 0
  ) {
    throw new Error("Las cantidades de cumplimiento deben ser enteros no negativos.");
  }

  const hours =
    committed > 0
      ? DEFAULT_COMMITTED_HOURS
      : DEFAULT_RESERVED_HOURS;

  return addHours(baseDate, hours).toISOString();
}

module.exports = {
  DEFAULT_RESERVED_HOURS,
  DEFAULT_COMMITTED_HOURS,
  estimatePromisedAt,
};
