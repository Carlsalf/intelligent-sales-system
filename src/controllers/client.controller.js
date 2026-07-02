const service = require("../services/client.service");

async function list(req, res, next) {
  try {
    const data = await service.list();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await service.create(req.body);
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


async function reactivate(req, res, next) {
  try {
    const data = await service.reactivate(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, reactivate };
