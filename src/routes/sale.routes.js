const router = require("express").Router();
const {
  authJwt,
  requireAdmin,
  requireCommercial,
} = require("../middlewares/authJwt");
const controller = require("../controllers/sale.controller");

router.get("/", authJwt, requireCommercial, controller.list);
router.get("/:id", authJwt, requireCommercial, controller.detail);
router.post("/", authJwt, requireCommercial, controller.create);
router.put("/:id/anular", authJwt, requireAdmin, controller.cancel);

module.exports = router;
