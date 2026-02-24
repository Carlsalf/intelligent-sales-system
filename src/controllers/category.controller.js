const {
  listCategorias,
  addCategoria,
  editCategoria,
  removeCategoria,
} = require("../services/category.service");

async function list(req, res, next) {
  try {
    const data = await listCategorias();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body || {};
    const data = await addCategoria(nombre);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre } = req.body || {};
    const data = await editCategoria(id, nombre);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const data = await removeCategoria(id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
