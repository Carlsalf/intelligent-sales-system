const { listClientes, createCliente } = require("../repositories/client.repo");

async function list() {
  return listClientes();
}

async function create(body) {
  const nombre = (body?.nombre || "").trim();
  if (!nombre) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }

  const documento = (body?.documento || "").toString().trim() || null;
  const telefono = (body?.telefono || "").toString().replace(/\s+/g, "").trim() || null;
  const email = (body?.email || "").toString().trim() || null;

  return createCliente({ nombre, documento, telefono, email });
}

module.exports = { list, create };
