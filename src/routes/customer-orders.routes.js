const router = require("express").Router();

const {
  authCustomerJwt,
  requireCustomerScope,
} = require(
  "../middlewares/authCustomerJwt"
);

const controller = require(
  "../controllers/customer-orders.controller"
);

router.get(
  "/",
  authCustomerJwt,
  requireCustomerScope("orders:read"),
  controller.listCustomerOrders
);

router.get(
  "/:id",
  authCustomerJwt,
  requireCustomerScope("orders:read"),
  controller.getCustomerOrder
);

module.exports = router;
