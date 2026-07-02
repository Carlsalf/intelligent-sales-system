const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");
const { requireAdmin } = require("../middlewares/requireAdmin");
const controller = require("../controllers/client.controller");

router.get("/", authJwt, controller.list);
router.post("/", authJwt, requireAdmin, controller.create);
router.put("/:id", authJwt, requireAdmin, controller.update);
router.put("/:id/reactivar", authJwt, requireAdmin, controller.reactivate);
router.delete("/:id", authJwt, requireAdmin, controller.remove);

module.exports = router;
