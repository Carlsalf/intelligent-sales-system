function requireAdmin(req, res, next) {
  // id_rol: 1 = admin (por seed). Si luego cambias, lo ajustamos.
  if (!req.user || req.user.id_rol !== 1) {
    return res.status(403).json({ message: "Acceso denegado: requiere rol admin" });
  }
  return next();
}

module.exports = { requireAdmin };
