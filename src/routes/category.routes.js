const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");
const { requireAdmin } = require("../middlewares/requireAdmin");
const controller = require("../controllers/category.controller");

// Todos autenticados pueden listar
router.get("/", authJwt, controller.list);

// Solo admin puede crear / editar / eliminar
router.post("/", authJwt, requireAdmin, controller.create);
router.put("/:id", authJwt, requireAdmin, controller.update);
router.delete("/:id", authJwt, requireAdmin, controller.remove);

module.exports = router;
