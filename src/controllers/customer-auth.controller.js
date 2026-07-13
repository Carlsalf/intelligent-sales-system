const {
  registerCustomer,
  loginCustomer,
  getAuthenticatedCustomer,
} = require("../services/customer-auth.service");

async function registerCustomerController(req, res, next) {
  try {
    const result = await registerCustomer(req.body || {});

    return res.status(201).json({
      message: "Cuenta de cliente creada correctamente",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

async function loginCustomerController(req, res, next) {
  try {
    const result = await loginCustomer(req.body || {});

    return res.json({
      message: "Inicio de sesión correcto",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

async function meCustomerController(req, res, next) {
  try {
    const customer = await getAuthenticatedCustomer(
      req.customer.id_cliente
    );

    return res.json({
      customer,
    });
  } catch (error) {
    return next(error);
  }
}

function logoutCustomerController(req, res) {
  return res.json({
    message: "Sesión de cliente cerrada correctamente",
  });
}

module.exports = {
  registerCustomerController,
  loginCustomerController,
  meCustomerController,
  logoutCustomerController,
};
