const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByEmail } = require("../repositories/user.repo");

async function login(email, password) {
  const user = await getUserByEmail(email);

  if (!user || user.estado !== 1) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  if (!process.env.JWT_SECRET) {
    const err = new Error("JWT_SECRET no configurado");
    err.status = 500;
    throw err;
  }

  const token = jwt.sign(
    { id_usuario: user.id_usuario, id_rol: user.id_rol, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
  );

  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      id_rol: user.id_rol,
    },
  };
}

module.exports = { login };
