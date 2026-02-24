const router = require("express").Router();
const { authJwt } = require("../middlewares/authJwt");

router.get("/", authJwt, (req, res) => {
  res.json({ message: "Acceso concedido", user: req.user });
});

module.exports = router;
