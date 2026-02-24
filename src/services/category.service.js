const {
  allCategorias,
  createCategoria,
  updateCategoria,
  softDeleteCategoria,
} = require("../repositories/category.repo");

async function listCategorias() {
  return allCategorias();
}

async function addCategoria(nombre) {
  if (!nombre || !nombre.trim()) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }
  return createCategoria(nombre.trim());
}

async function editCategoria(id, nombre) {
  if (!id || isNaN(Number(id))) {
    const err = new Error("id inválido");
    err.status = 400;
    throw err;
  }
  if (!nombre || !nombre.trim()) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }
  const result = await updateCategoria(Number(id), nombre.trim());
  if (result.changes === 0) {
    const err = new Error("Categoría no encontrada");
    err.status = 404;
    throw err;
  }
  return { message: "Categoría actualizada" };
}

async function removeCategoria(id) {
  if (!id || isNaN(Number(id))) {
    const err = new Error("id inválido");
    err.status = 400;
    throw err;
  }
  const result = await softDeleteCategoria(Number(id));
  if (result.changes === 0) {
    const err = new Error("Categoría no encontrada");
    err.status = 404;
    throw err;
  }
  return { message: "Categoría eliminada (lógica)" };
}

module.exports = { listCategorias, addCategoria, editCategoria, removeCategoria };
