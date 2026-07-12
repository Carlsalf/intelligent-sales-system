const service = require("../services/cart.service");

async function getCart(req, res, next) {
  try {
    const cart = await service.getOrCreateOpenCart(req.params.id_cliente);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const cart = await service.addItem(req.params.id_cliente, req.body);
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const cart = await service.updateItem(
      req.params.id_cliente,
      req.params.id_producto,
      req.body
    );

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function removeItem(req, res, next) {
  try {
    const cart = await service.removeItem(
      req.params.id_cliente,
      req.params.id_producto
    );

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function emptyCart(req, res, next) {
  try {
    const cart = await service.emptyCart(req.params.id_cliente);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  emptyCart,
};
