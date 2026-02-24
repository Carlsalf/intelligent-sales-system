const { listProductos, createProducto, updateProducto, softDeleteProducto } = require("../repositories/product.repo");

function asNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    const err = new Error(`${name} inválido`);
    err.status = 400;
    throw err;
  }
  return n;
}

async function getAll() {
  return listProductos();
}

async function add(body) {
  const nombre = (body?.nombre || "").trim();
  if (!nombre) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }

  const precio = asNumber(body?.precio, "precio");
  if (precio < 0) {
    const err = new Error("precio no puede ser negativo");
    err.status = 400;
    throw err;
  }

  const stock = body?.stock === undefined ? 0 : asNumber(body.stock, "stock");
  if (!Number.isInteger(stock) || stock < 0) {
    const err = new Error("stock debe ser entero >= 0");
    err.status = 400;
    throw err;
  }

  const id_categoria = asNumber(body?.id_categoria, "id_categoria");
  if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
    const err = new Error("id_categoria inválido");
    err.status = 400;
    throw err;
  }

  return createProducto({ nombre, precio, stock, id_categoria });
}

async function edit(id, body) {
  const id_producto = asNumber(id, "id_producto");
  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    const err = new Error("id_producto inválido");
    err.status = 400;
    throw err;
  }

  const nombre = (body?.nombre || "").trim();
  if (!nombre) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }

  const precio = asNumber(body?.precio, "precio");
  const stock = asNumber(body?.stock, "stock");
  const id_categoria = asNumber(body?.id_categoria, "id_categoria");

  const result = await updateProducto(id_producto, { nombre, precio, stock, id_categoria });
  if (result.changes === 0) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }
  return { message: "Producto actualizado" };
}

async function remove(id) {
  const id_producto = asNumber(id, "id_producto");
  const result = await softDeleteProducto(id_producto);
  if (result.changes === 0) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }
  return { message: "Producto eliminado (lógico)" };
}

module.exports = { getAll, add, edit, remove };
