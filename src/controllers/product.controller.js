const service = require("../services/product.service");

async function list(req, res, next) {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await service.add(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await service.edit(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await service.remove(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
