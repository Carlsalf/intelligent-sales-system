const router = require("express").Router();
const { authJwt, requireAdmin } = require("../middlewares/authJwt");
const controller = require("../controllers/user-management.controller");

router.get("/", authJwt, requireAdmin, controller.list);
router.get("/roles", authJwt, requireAdmin, controller.roles);
router.post("/", authJwt, requireAdmin, controller.create);
router.patch("/:id/status", authJwt, requireAdmin, controller.updateStatus);

module.exports = router;
