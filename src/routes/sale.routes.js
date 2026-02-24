const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");
const controller = require("../controllers/sale.controller");

router.get("/", authJwt, controller.list);
router.post("/", authJwt, controller.create);

module.exports = router;
