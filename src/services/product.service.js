const repo = require("../repositories/product.repo");

function validateProductPayload(payload) {
  const nombre = String(payload.nombre || "").trim();
  const precio = Number(payload.precio);
  const stock = Number(payload.stock);

  if (!nombre) {
    const err = new Error("El nombre del producto es obligatorio.");
    err.status = 400;
    throw err;
  }

  if (!Number.isFinite(precio) || precio <= 0 || precio > 99999.99) {
    const err = new Error("El precio debe ser mayor que 0 y menor o igual a 99999.99.");
    err.status = 400;
    throw err;
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
    const err = new Error("El stock debe ser un número entero entre 0 y 9999 unidades.");
    err.status = 400;
    throw err;
  }

  return { nombre, precio, stock };
}

async function resolveCategoria(payload) {
  if (payload.id_categoria) {
    return Number(payload.id_categoria);
  }

  if (payload.categoria) {
    const categoria = await repo.findCategoriaByName(String(payload.categoria).trim());

    if (!categoria) {
      const err = new Error("La categoría indicada no existe en el catálogo.");
      err.status = 400;
      throw err;
    }

    return categoria.id_categoria;
  }

  const err = new Error("Debe indicar id_categoria o categoria.");
  err.status = 400;
  throw err;
}

async function getAll() {
  return repo.listProductos();
}

async function add(payload) {
  const base = validateProductPayload(payload);
  const id_categoria = await resolveCategoria(payload);

  const created = await repo.createProducto({
    ...base,
    id_categoria,
  });

  return repo.getProductoById(created.id_producto);
}

async function edit(id, payload) {
  const base = validateProductPayload(payload);
  const id_categoria = await resolveCategoria(payload);

  const result = await repo.updateProducto(Number(id), {
    ...base,
    id_categoria,
  });

  if (!result.changes) {
    const err = new Error("Producto no encontrado o sin cambios aplicados.");
    err.status = 404;
    throw err;
  }

  return repo.getProductoById(Number(id));
}

async function remove(id) {
  const result = await repo.softDeleteProducto(Number(id));

  if (!result.changes) {
    const err = new Error("Producto no encontrado.");
    err.status = 404;
    throw err;
  }

  return { deleted: true, id_producto: Number(id) };
}

module.exports = {
  getAll,
  add,
  edit,
  remove,
};
