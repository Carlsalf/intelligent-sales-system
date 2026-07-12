const repository = require("../repositories/cart.repo");

function positiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} debe ser un entero mayor que cero.`);
    error.status = 400;
    throw error;
  }

  return parsed;
}

async function validateClient(id_cliente) {
  const clientId = positiveInteger(id_cliente, "id_cliente");
  const client = await repository.findClientById(clientId);

  if (!client) {
    const error = new Error("El cliente no existe.");
    error.status = 404;
    throw error;
  }

  if (Number(client.estado) === 0) {
    const error = new Error("El cliente se encuentra dado de baja.");
    error.status = 409;
    throw error;
  }

  return clientId;
}

async function getOrCreateOpenCart(id_cliente) {
  const clientId = await validateClient(id_cliente);
  let cart = await repository.findOpenCartByClient(clientId);

  if (!cart) {
    cart = await repository.createOpenCart(clientId);
  }

  return repository.getCartWithItems(cart.id_carrito);
}

async function addItem(id_cliente, body) {
  const clientId = await validateClient(id_cliente);
  const productId = positiveInteger(body?.id_producto, "id_producto");
  const quantity = positiveInteger(body?.cantidad, "cantidad");

  const product = await repository.findActiveProduct(productId);

  if (!product || Number(product.estado) === 0) {
    const error = new Error("El producto no existe o no está disponible.");
    error.status = 404;
    throw error;
  }

  let cart = await repository.findOpenCartByClient(clientId);

  if (!cart) {
    cart = await repository.createOpenCart(clientId);
  }

  await repository.addOrIncrementItem({
    id_carrito: cart.id_carrito,
    id_producto: productId,
    cantidad: quantity,
  });

  return repository.getCartWithItems(cart.id_carrito);
}

async function updateItem(id_cliente, id_producto, body) {
  const clientId = await validateClient(id_cliente);
  const productId = positiveInteger(id_producto, "id_producto");
  const quantity = positiveInteger(body?.cantidad, "cantidad");

  const cart = await repository.findOpenCartByClient(clientId);

  if (!cart) {
    const error = new Error("El cliente no tiene un carrito abierto.");
    error.status = 404;
    throw error;
  }

  const result = await repository.updateItemQuantity({
    id_carrito: cart.id_carrito,
    id_producto: productId,
    cantidad: quantity,
  });

  if (!result.updated) {
    const error = new Error("El producto no se encuentra en el carrito.");
    error.status = 404;
    throw error;
  }

  return repository.getCartWithItems(cart.id_carrito);
}

async function removeItem(id_cliente, id_producto) {
  const clientId = await validateClient(id_cliente);
  const productId = positiveInteger(id_producto, "id_producto");

  const cart = await repository.findOpenCartByClient(clientId);

  if (!cart) {
    const error = new Error("El cliente no tiene un carrito abierto.");
    error.status = 404;
    throw error;
  }

  const result = await repository.removeItem({
    id_carrito: cart.id_carrito,
    id_producto: productId,
  });

  if (!result.removed) {
    const error = new Error("El producto no se encuentra en el carrito.");
    error.status = 404;
    throw error;
  }

  return repository.getCartWithItems(cart.id_carrito);
}

async function emptyCart(id_cliente) {
  const clientId = await validateClient(id_cliente);
  const cart = await repository.findOpenCartByClient(clientId);

  if (!cart) {
    const error = new Error("El cliente no tiene un carrito abierto.");
    error.status = 404;
    throw error;
  }

  await repository.clearCart(cart.id_carrito);

  return repository.getCartWithItems(cart.id_carrito);
}

module.exports = {
  getOrCreateOpenCart,
  addItem,
  updateItem,
  removeItem,
  emptyCart,
};
