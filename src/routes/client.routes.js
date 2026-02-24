const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");
const { requireAdmin } = require("../middlewares/requireAdmin");
const controller = require("../controllers/client.controller");

router.get("/", authJwt, controller.list);
router.post("/", authJwt, requireAdmin, controller.create);

module.exports = router;
