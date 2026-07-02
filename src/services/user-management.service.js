const bcrypt = require("bcryptjs");
const repo = require("../repositories/user-management.repo");

const ALLOWED_ROLES = [1, 2, 3];

async function listUsers() {
  return repo.listUsers();
}

async function listRoles() {
  return repo.listRoles();
}

async function createUser(body) {
  const nombre = String(body?.nombre || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const id_rol = Number(body?.id_rol);

  if (!nombre || nombre.length < 3) {
    const err = new Error("El nombre del usuario es requerido.");
    err.status = 400;
    throw err;
  }

  if (!email || !email.includes("@")) {
    const err = new Error("El correo electrónico debe tener un formato válido.");
    err.status = 400;
    throw err;
  }

  if (!password || password.length < 6) {
    const err = new Error("La contraseña debe tener al menos 6 caracteres.");
    err.status = 400;
    throw err;
  }

  if (!ALLOWED_ROLES.includes(id_rol)) {
    const err = new Error("Rol no válido.");
    err.status = 400;
    throw err;
  }

  const existing = await repo.getUserByEmail(email);
  if (existing) {
    const err = new Error("Ya existe un usuario registrado con este correo.");
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  return repo.createUser({ nombre, email, password_hash, id_rol });
}

async function updateStatus(id, body, currentUser) {
  const id_usuario = Number(id);
  const estado = Number(body?.estado);

  if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
    const err = new Error("Usuario no válido.");
    err.status = 400;
    throw err;
  }

  if (![0, 1].includes(estado)) {
    const err = new Error("Estado no válido.");
    err.status = 400;
    throw err;
  }

  if (Number(currentUser?.id_usuario) === id_usuario && estado === 0) {
    const err = new Error("No puedes desactivar tu propia cuenta.");
    err.status = 400;
    throw err;
  }

  const result = await repo.updateUserStatus(id_usuario, estado);

  if (!result.changed) {
    const err = new Error("Usuario no encontrado.");
    err.status = 404;
    throw err;
  }

  return result;
}

module.exports = {
  listUsers,
  listRoles,
  createUser,
  updateStatus,
};
