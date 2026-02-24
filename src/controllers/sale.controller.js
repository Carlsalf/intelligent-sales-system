const service = require("../services/sale.service");

async function create(req, res, next) {
  try {
    const data = await service.createVenta(req.body, req.user);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const data = await service.list();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list };
