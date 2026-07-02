const repo = require("../repositories/client.repo");

function validateClientePayload(body) {
  const nombre = String(body?.nombre || "").trim();
  const documento = String(body?.documento || "").trim().toUpperCase() || null;
  const telefono = String(body?.telefono || "").replace(/\s+/g, "").trim() || null;
  const email = String(body?.email || "").trim().toLowerCase() || null;

  if (!nombre) {
    const err = new Error("El nombre del cliente es obligatorio.");
    err.status = 400;
    throw err;
  }

  if (nombre.length < 3 || nombre.length > 80) {
    const err = new Error("El nombre debe tener entre 3 y 80 caracteres.");
    err.status = 400;
    throw err;
  }

  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,'&-]+$/.test(nombre)) {
    const err = new Error("El nombre contiene caracteres no válidos.");
    err.status = 400;
    throw err;
  }

  if (documento && !/^[A-Z][0-9]{8}$/.test(documento)) {
    const err = new Error("El documento debe tener una letra inicial y 8 dígitos. Ejemplo: U87890967.");
    err.status = 400;
    throw err;
  }

  if (telefono && !/^[6789][0-9]{8}$/.test(telefono)) {
    const err = new Error("El teléfono debe tener 9 dígitos válidos en España.");
    err.status = 400;
    throw err;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    const err = new Error("El correo electrónico debe tener un formato válido.");
    err.status = 400;
    throw err;
  }

  return { nombre, documento, telefono, email };
}

async function list() {
  return repo.listClientes();
}

async function create(body) {
  const payload = validateClientePayload(body);
  const created = await repo.createCliente(payload);
  return repo.getClienteById(created.id_cliente);
}

async function edit(id, body) {
  const id_cliente = Number(id);

  if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
    const err = new Error("Cliente inválido.");
    err.status = 400;
    throw err;
  }

  const payload = validateClientePayload(body);
  const result = await repo.updateCliente(id_cliente, payload);

  if (!result.changes) {
    const err = new Error("Cliente no encontrado.");
    err.status = 404;
    throw err;
  }

  return repo.getClienteById(id_cliente);
}

async function remove(id) {
  const id_cliente = Number(id);

  if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
    const err = new Error("Cliente inválido.");
    err.status = 400;
    throw err;
  }

  const result = await repo.softDeleteCliente(id_cliente);

  if (!result.changes) {
    const err = new Error("Cliente no encontrado.");
    err.status = 404;
    throw err;
  }

  return { deleted: true, id_cliente };
}


async function reactivate(id) {
  const id_cliente = Number(id);

  if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
    const err = new Error("Cliente inválido.");
    err.status = 400;
    throw err;
  }

  const result = await repo.reactivateCliente(id_cliente);

  if (!result.changes) {
    const err = new Error("Cliente no encontrado o ya se encuentra activo.");
    err.status = 404;
    throw err;
  }

  return repo.getClienteById(id_cliente);
}

module.exports = { list, create, edit, remove, reactivate };
