const router = require("express").Router();
const {
  authJwt,
  requireManagerOrAdmin,
} = require("../middlewares/authJwt");
const controller = require("../controllers/analytics.controller");

router.get(
  "/summary",
  authJwt,
  requireManagerOrAdmin,
  controller.summary
);

module.exports = router;
