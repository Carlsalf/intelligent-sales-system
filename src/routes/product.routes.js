const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");
const { requireAdmin } = require("../middlewares/requireAdmin");
const controller = require("../controllers/product.controller");

// autenticados listan
router.get("/", authJwt, controller.list);

// solo admin crea/edita/elimina
router.post("/", authJwt, requireAdmin, controller.create);
router.put("/:id", authJwt, requireAdmin, controller.update);
router.delete("/:id", authJwt, requireAdmin, controller.remove);

module.exports = router;
