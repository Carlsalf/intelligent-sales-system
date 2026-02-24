const { createVentaWithDetalles, listVentas } = require("../repositories/sale.repo");

async function createVenta(body, user) {
  const id_cliente = body?.id_cliente ? Number(body.id_cliente) : null;
  const items = Array.isArray(body?.items) ? body.items : [];

  const id_usuario = user?.id_usuario;
  if (!id_usuario) {
    const err = new Error("Usuario no autenticado");
    err.status = 401;
    throw err;
  }

  try {
    const result = await createVentaWithDetalles({ id_cliente, id_usuario, items });
    return result;
  } catch (e) {
    const err = new Error(e.message || "Error creando venta");
    err.status = 400;
    throw err;
  }
}

async function list() {
  return listVentas();
}

module.exports = { createVenta, list };
