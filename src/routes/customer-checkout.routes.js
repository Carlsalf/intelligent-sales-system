const router = require("express").Router();

const {
  authCustomerJwt,
  requireCustomerScope,
} = require("../middlewares/authCustomerJwt");

const {
  processCustomerCheckout,
} = require("../controllers/customer-checkout.controller");

router.post(
  "/",
  authCustomerJwt,
  requireCustomerScope("checkout:write"),
  processCustomerCheckout
);

module.exports = router;
