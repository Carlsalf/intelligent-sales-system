const jwt = require("jsonwebtoken");

const ROLES = {
  ADMIN: 1,
  VENDEDOR: 2,
  GERENTE: 3,
};

function authJwt(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const idRol = Number(req.user?.id_rol);

    if (!rolesPermitidos.includes(idRol)) {
      return res.status(403).json({
        message: "Acceso denegado. No tienes permisos para esta operación.",
      });
    }

    return next();
  };
}

const requireAdmin = requireRole(ROLES.ADMIN);
const requireManagerOrAdmin = requireRole(ROLES.ADMIN, ROLES.GERENTE);
const requireCommercial = requireRole(ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR);

module.exports = {
  authJwt,
  requireRole,
  requireAdmin,
  requireManagerOrAdmin,
  requireCommercial,
  ROLES,
};
