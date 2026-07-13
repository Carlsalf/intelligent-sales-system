const jwt = require("jsonwebtoken");

const CUSTOMER_TOKEN_TYPE = "CUSTOMER";

function authCustomerJwt(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Token de cliente requerido",
      code: "CUSTOMER_TOKEN_REQUIRED",
    });
  }

  const secret = process.env.JWT_CUSTOMER_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: "La autenticación de clientes no está configurada",
      code: "CUSTOMER_JWT_NOT_CONFIGURED",
    });
  }

  try {
    const payload = jwt.verify(token, secret);

    if (payload.token_type !== CUSTOMER_TOKEN_TYPE) {
      return res.status(401).json({
        error: "Tipo de token no válido para el canal eCommerce",
        code: "INVALID_CUSTOMER_TOKEN_TYPE",
      });
    }

    const idCliente = Number(payload.id_cliente);
    const idCuenta = Number(payload.id_cliente_cuenta);

    if (
      !Number.isInteger(idCliente) ||
      idCliente <= 0 ||
      !Number.isInteger(idCuenta) ||
      idCuenta <= 0
    ) {
      return res.status(401).json({
        error: "Identidad de cliente inválida",
        code: "INVALID_CUSTOMER_IDENTITY",
      });
    }

    req.customer = {
      id_cliente: idCliente,
      id_cliente_cuenta: idCuenta,
      email: payload.email,
      token_type: payload.token_type,
      scope: Array.isArray(payload.scope) ? payload.scope : [],
    };

    return next();
  } catch (error) {
    const expired = error?.name === "TokenExpiredError";

    return res.status(401).json({
      error: expired
        ? "La sesión del cliente ha expirado"
        : "Token de cliente inválido",
      code: expired
        ? "CUSTOMER_TOKEN_EXPIRED"
        : "INVALID_CUSTOMER_TOKEN",
    });
  }
}

function requireCustomerScope(...requiredScopes) {
  return (req, res, next) => {
    const scopes = Array.isArray(req.customer?.scope)
      ? req.customer.scope
      : [];

    const allowed = requiredScopes.every((scope) =>
      scopes.includes(scope)
    );

    if (!allowed) {
      return res.status(403).json({
        error: "La cuenta no dispone de permisos para esta operación",
        code: "CUSTOMER_SCOPE_FORBIDDEN",
      });
    }

    return next();
  };
}

module.exports = {
  authCustomerJwt,
  requireCustomerScope,
  CUSTOMER_TOKEN_TYPE,
};
