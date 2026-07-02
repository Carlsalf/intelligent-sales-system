const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByEmail, getUserById } = require("../repositories/user.repo");

function publicUser(user) {
  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    id_rol: user.id_rol,
    rol: user.rol,
  };
}

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

  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      rol: user.rol,
      nombre: user.nombre,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
  );

  return { token, user: publicUser(user) };
}

async function me(id_usuario) {
  const user = await getUserById(id_usuario);

  if (!user || user.estado !== 1) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  return publicUser(user);
}

module.exports = { login, me };
