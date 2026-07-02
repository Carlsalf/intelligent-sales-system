const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");
const controller = require("../controllers/analytics.controller");

router.get("/summary", authJwt, controller.summary);

module.exports = router;
