const repository = require(
  "../repositories/customer-address.repo"
);

function createHttpError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function positiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createHttpError(
      `${fieldName} debe ser un entero mayor que cero`,
      400,
      "INVALID_POSITIVE_INTEGER"
    );
  }

  return parsed;
}

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeBoolean(value) {
  return value === true ||
    value === 1 ||
    value === "1"
    ? 1
    : 0;
}

function validateAddressPayload(payload = {}) {
  const address = {
    alias:
      normalizeText(payload.alias) || "Principal",
    destinatario: normalizeText(
      payload.destinatario
    ),
    telefono: normalizeText(payload.telefono),
    direccion_linea_1: normalizeText(
      payload.direccion_linea_1
    ),
    direccion_linea_2:
      normalizeText(payload.direccion_linea_2) ||
      null,
    ciudad: normalizeText(payload.ciudad),
    provincia: normalizeText(payload.provincia),
    codigo_postal: normalizeText(
      payload.codigo_postal
    ),
    pais:
      normalizeText(payload.pais) || "España",
    referencia:
      normalizeText(payload.referencia) || null,
    es_principal: normalizeBoolean(
      payload.es_principal
    ),
  };

  const required = [
    "destinatario",
    "telefono",
    "direccion_linea_1",
    "ciudad",
    "provincia",
    "codigo_postal",
  ];

  const missing = required.filter(
    (field) => !address[field]
  );

  if (missing.length) {
    throw createHttpError(
      `Faltan campos obligatorios: ${missing.join(", ")}`,
      400,
      "INCOMPLETE_CUSTOMER_ADDRESS"
    );
  }

  if (address.alias.length > 50) {
    throw createHttpError(
      "El alias no puede superar los 50 caracteres",
      400,
      "INVALID_ADDRESS_ALIAS"
    );
  }

  if (address.destinatario.length < 2) {
    throw createHttpError(
      "El destinatario no tiene un formato válido",
      400,
      "INVALID_ADDRESS_RECIPIENT"
    );
  }

  if (!/^[0-9+()\s-]{7,20}$/.test(address.telefono)) {
    throw createHttpError(
      "El teléfono no tiene un formato válido",
      400,
      "INVALID_ADDRESS_PHONE"
    );
  }

  if (
    address.pais.toLowerCase() === "españa" &&
    !/^\d{5}$/.test(address.codigo_postal)
  ) {
    throw createHttpError(
      "El código postal para España debe contener 5 dígitos",
      400,
      "INVALID_POSTAL_CODE"
    );
  }

  return address;
}

function toPublicAddress(address) {
  return {
    ...address,
    es_principal:
      Number(address.es_principal) === 1,
    estado: Number(address.estado) === 1,
  };
}

async function listAddresses(id_cliente) {
  const customerId = positiveInteger(
    id_cliente,
    "id_cliente"
  );

  const addresses =
    await repository.listCustomerAddresses(
      customerId
    );

  return addresses.map(toPublicAddress);
}

async function getAddress(
  id_cliente,
  id_direccion
) {
  const customerId = positiveInteger(
    id_cliente,
    "id_cliente"
  );

  const addressId = positiveInteger(
    id_direccion,
    "id_direccion"
  );

  const address =
    await repository.getCustomerAddressById(
      customerId,
      addressId
    );

  if (!address) {
    throw createHttpError(
      "Dirección no encontrada",
      404,
      "CUSTOMER_ADDRESS_NOT_FOUND"
    );
  }

  return toPublicAddress(address);
}

async function createAddress(
  id_cliente,
  payload
) {
  const customerId = positiveInteger(
    id_cliente,
    "id_cliente"
  );

  const address = validateAddressPayload(payload);

  const created =
    await repository.createCustomerAddress(
      customerId,
      address
    );

  return toPublicAddress(created);
}

async function updateAddress(
  id_cliente,
  id_direccion,
  payload
) {
  const customerId = positiveInteger(
    id_cliente,
    "id_cliente"
  );

  const addressId = positiveInteger(
    id_direccion,
    "id_direccion"
  );

  const address = validateAddressPayload(payload);

  const updated =
    await repository.updateCustomerAddress(
      customerId,
      addressId,
      address
    );

  return toPublicAddress(updated);
}

async function setDefaultAddress(
  id_cliente,
  id_direccion
) {
  const customerId = positiveInteger(
    id_cliente,
    "id_cliente"
  );

  const addressId = positiveInteger(
    id_direccion,
    "id_direccion"
  );

  const updated =
    await repository.setDefaultCustomerAddress(
      customerId,
      addressId
    );

  return toPublicAddress(updated);
}

async function deleteAddress(
  id_cliente,
  id_direccion
) {
  const customerId = positiveInteger(
    id_cliente,
    "id_cliente"
  );

  const addressId = positiveInteger(
    id_direccion,
    "id_direccion"
  );

  return repository.deactivateCustomerAddress(
    customerId,
    addressId
  );
}

module.exports = {
  listAddresses,
  getAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
