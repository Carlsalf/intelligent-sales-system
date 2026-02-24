const router = require("express").Router();
const { loginController } = require("../controllers/auth.controller");

router.post("/login", loginController);

module.exports = router;
