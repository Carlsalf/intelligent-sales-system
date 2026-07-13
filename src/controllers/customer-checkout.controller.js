const {
  checkoutCustomer,
} = require("../services/checkout.service");

async function processCustomerCheckout(
  req,
  res,
  next
) {
  try {
    const result = await checkoutCustomer(
      req.customer,
      req.body || {}
    );

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  processCustomerCheckout,
};
