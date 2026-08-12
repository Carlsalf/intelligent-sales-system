const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  getCustomerAccountByEmail,
  getCustomerAccountById,
  createCustomerIdentity,
  updateCustomerLastAccess,
} = require("../repositories/customer-auth.repo");

const CUSTOMER_TOKEN_TYPE = "CUSTOMER";

const CUSTOMER_SCOPES = [
  "store:read",
  "cart:write",
  "checkout:write",
  "orders:read",
];

function createHttpError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw createHttpError(
      "La contraseña debe contener al menos 8 caracteres",
      400,
      "INVALID_PASSWORD"
    );
  }

  if (!/[a-z]/.test(password)) {
    throw createHttpError(
      "La contraseña debe incluir al menos una letra minúscula",
      400,
      "INVALID_PASSWORD"
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw createHttpError(
      "La contraseña debe incluir al menos una letra mayúscula",
      400,
      "INVALID_PASSWORD"
    );
  }

  if (!/\d/.test(password)) {
    throw createHttpError(
      "La contraseña debe incluir al menos un número",
      400,
      "INVALID_PASSWORD"
    );
  }
}

function toPublicCustomer(account) {
  return {
    id_cliente: account.id_cliente,
    id_cliente_cuenta: account.id_cliente_cuenta,
    nombre: account.nombre,
    documento: account.documento || null,
    telefono: account.telefono || null,
    email: account.email,
    email_verificado: Number(account.email_verificado) === 1,
    ultimo_acceso: account.ultimo_acceso || null,
  };
}

function signCustomerToken(account) {
  const secret = process.env.JWT_CUSTOMER_SECRET;

  if (!secret) {
    throw createHttpError(
      "La autenticación de clientes no está configurada",
      500,
      "CUSTOMER_JWT_NOT_CONFIGURED"
    );
  }

  return jwt.sign(
    {
      sub: String(account.id_cliente_cuenta),
      id_cliente_cuenta: account.id_cliente_cuenta,
      id_cliente: account.id_cliente,
      email: account.email,
      token_type: CUSTOMER_TOKEN_TYPE,
      scope: CUSTOMER_SCOPES,
    },
    secret,
    {
      expiresIn: process.env.JWT_CUSTOMER_EXPIRES_IN || "7d",
    }
  );
}

async function registerCustomer(payload = {}) {
  const nombre = normalizeText(payload.nombre);
  const documento = normalizeText(payload.documento) || null;
  const telefono = normalizeText(payload.telefono) || null;
  const email = normalizeEmail(payload.email);
  const password = payload.password;

  if (
    telefono &&
    (!/^\d{9,15}$/.test(telefono))
  ) {
    throw createHttpError(
      "El teléfono debe contener entre 9 y 15 dígitos",
      400,
      "INVALID_PHONE"
    );
  }

  if (nombre.length < 2) {
    throw createHttpError(
      "El nombre del cliente es obligatorio",
      400,
      "INVALID_NAME"
    );
  }

  if (!isValidEmail(email)) {
    throw createHttpError(
      "El correo electrónico no tiene un formato válido",
      400,
      "INVALID_EMAIL"
    );
  }

  validatePassword(password);

  const existingAccount = await getCustomerAccountByEmail(email);

  if (existingAccount) {
    throw createHttpError(
      "Ya existe una cuenta registrada con este correo electrónico",
      409,
      "CUSTOMER_EMAIL_ALREADY_EXISTS"
    );
  }

  const password_hash = await bcrypt.hash(password, 12);

  let createdCustomer;

  try {
    createdCustomer = await createCustomerIdentity({
      nombre,
      documento,
      telefono,
      email,
      password_hash,
    });
  } catch (error) {
    const message = String(error?.message || "");

    if (
      error?.code === "SQLITE_CONSTRAINT" ||
      message.includes("UNIQUE constraint failed")
    ) {
      throw createHttpError(
        "Ya existe una cuenta registrada con este correo electrónico",
        409,
        "CUSTOMER_EMAIL_ALREADY_EXISTS"
      );
    }

    throw error;
  }

  const token = signCustomerToken(createdCustomer);

  return {
    token,
    customer: toPublicCustomer(createdCustomer),
  };
}

async function loginCustomer(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = payload.password;

  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    throw createHttpError(
      "Credenciales inválidas",
      401,
      "INVALID_CUSTOMER_CREDENTIALS"
    );
  }

  const account = await getCustomerAccountByEmail(email);

  if (
    !account ||
    Number(account.cuenta_estado) !== 1 ||
    Number(account.cliente_estado) !== 1
  ) {
    throw createHttpError(
      "Credenciales inválidas",
      401,
      "INVALID_CUSTOMER_CREDENTIALS"
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    account.password_hash
  );

  if (!passwordMatches) {
    throw createHttpError(
      "Credenciales inválidas",
      401,
      "INVALID_CUSTOMER_CREDENTIALS"
    );
  }

  await updateCustomerLastAccess(account.id_cliente_cuenta);

  const authenticatedAccount = {
    ...account,
    ultimo_acceso: new Date().toISOString(),
  };

  const token = signCustomerToken(authenticatedAccount);

  return {
    token,
    customer: toPublicCustomer(authenticatedAccount),
  };
}

async function getAuthenticatedCustomer(id_cliente) {
  const customerId = Number(id_cliente);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw createHttpError(
      "Identidad de cliente inválida",
      401,
      "INVALID_CUSTOMER_IDENTITY"
    );
  }

  const account = await getCustomerAccountById(customerId);

  if (
    !account ||
    Number(account.cuenta_estado) !== 1 ||
    Number(account.cliente_estado) !== 1
  ) {
    throw createHttpError(
      "Cuenta de cliente no encontrada o inactiva",
      404,
      "CUSTOMER_NOT_FOUND"
    );
  }

  return toPublicCustomer(account);
}

module.exports = {
  CUSTOMER_TOKEN_TYPE,
  CUSTOMER_SCOPES,
  registerCustomer,
  loginCustomer,
  getAuthenticatedCustomer,
};
