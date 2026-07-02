const router = require("express").Router();
const { loginController, meController } = require("../controllers/auth.controller");
const { authJwt } = require("../middlewares/authJwt");

router.post("/login", loginController);
router.get("/me", authJwt, meController);

module.exports = router;
