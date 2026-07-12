const router = require("express").Router();
const {
  authJwt,
  requireCommercial,
} = require("../middlewares/authJwt");

const controller = require("../controllers/checkout.controller");

router.post(
  "/:id_cliente",
  authJwt,
  requireCommercial,
  controller.processCheckout
);

module.exports = router;
