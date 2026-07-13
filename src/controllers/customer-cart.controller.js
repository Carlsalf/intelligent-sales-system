const cartService = require("../services/cart.service");

async function getCustomerCart(req, res, next) {
  try {
    const cart = await cartService.getOrCreateOpenCart(
      req.customer.id_cliente
    );

    return res.json(cart);
  } catch (error) {
    return next(error);
  }
}

async function addCustomerCartItem(req, res, next) {
  try {
    const cart = await cartService.addItem(
      req.customer.id_cliente,
      req.body || {}
    );

    return res.status(201).json(cart);
  } catch (error) {
    return next(error);
  }
}

async function updateCustomerCartItem(req, res, next) {
  try {
    const cart = await cartService.updateItem(
      req.customer.id_cliente,
      req.params.id_producto,
      req.body || {}
    );

    return res.json(cart);
  } catch (error) {
    return next(error);
  }
}

async function removeCustomerCartItem(req, res, next) {
  try {
    const cart = await cartService.removeItem(
      req.customer.id_cliente,
      req.params.id_producto
    );

    return res.json(cart);
  } catch (error) {
    return next(error);
  }
}

async function emptyCustomerCart(req, res, next) {
  try {
    const cart = await cartService.emptyCart(
      req.customer.id_cliente
    );

    return res.json(cart);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCustomerCart,
  addCustomerCartItem,
  updateCustomerCartItem,
  removeCustomerCartItem,
  emptyCustomerCart,
};
