const router = require("express").Router();

const {
  authCustomerJwt,
  requireCustomerScope,
} = require("../middlewares/authCustomerJwt");

const {
  getCustomerCart,
  addCustomerCartItem,
  updateCustomerCartItem,
  removeCustomerCartItem,
  emptyCustomerCart,
} = require("../controllers/customer-cart.controller");

router.use(
  authCustomerJwt,
  requireCustomerScope("cart:write")
);

router.get("/", getCustomerCart);

router.post(
  "/items",
  addCustomerCartItem
);

router.put(
  "/items/:id_producto",
  updateCustomerCartItem
);

router.delete(
  "/items/:id_producto",
  removeCustomerCartItem
);

router.delete(
  "/items",
  emptyCustomerCart
);

module.exports = router;
