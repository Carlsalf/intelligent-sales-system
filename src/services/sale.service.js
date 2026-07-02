const { createVentaWithDetalles, listVentas, getVentaById, cancelVenta } = require("../repositories/sale.repo");

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

async function detail(id) {
  const id_venta = Number(id);

  if (!Number.isInteger(id_venta) || id_venta <= 0) {
    const err = new Error("Venta inválida");
    err.status = 400;
    throw err;
  }

  const venta = await getVentaById(id_venta);

  if (!venta) {
    const err = new Error("Venta no encontrada");
    err.status = 404;
    throw err;
  }

  return venta;
}

async function cancel(id) {
  const id_venta = Number(id);

  if (!Number.isInteger(id_venta) || id_venta <= 0) {
    const err = new Error("Venta inválida");
    err.status = 400;
    throw err;
  }

  try {
    return await cancelVenta(id_venta);
  } catch (e) {
    const err = new Error(e.message || "No fue posible anular la venta.");
    err.status = 400;
    throw err;
  }
}

module.exports = { createVenta, list, detail, cancel };
