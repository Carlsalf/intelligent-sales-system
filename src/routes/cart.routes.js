const router = require("express").Router();
const {
  authJwt,
  requireCommercial,
} = require("../middlewares/authJwt");

const controller = require("../controllers/cart.controller");

router.get(
  "/:id_cliente",
  authJwt,
  requireCommercial,
  controller.getCart
);

router.post(
  "/:id_cliente/items",
  authJwt,
  requireCommercial,
  controller.addItem
);

router.put(
  "/:id_cliente/items/:id_producto",
  authJwt,
  requireCommercial,
  controller.updateItem
);

router.delete(
  "/:id_cliente/items/:id_producto",
  authJwt,
  requireCommercial,
  controller.removeItem
);

router.delete(
  "/:id_cliente/items",
  authJwt,
  requireCommercial,
  controller.emptyCart
);

module.exports = router;
