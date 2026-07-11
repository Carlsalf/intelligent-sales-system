const express = require("express");
const { loginController } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", loginController);

// Temporalmente desactivado para pruebas
// router.get("/me", authJwt, meController);

module.exports = router;