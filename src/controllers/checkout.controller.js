const service = require("../services/checkout.service");

async function processCheckout(req, res, next) {
  try {
    const result = await service.checkout(
      req.params.id_cliente,
      req.body,
      req.user
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  processCheckout,
};
