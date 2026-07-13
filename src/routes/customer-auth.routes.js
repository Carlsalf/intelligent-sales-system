const router = require("express").Router();

const {
  registerCustomerController,
  loginCustomerController,
  meCustomerController,
  logoutCustomerController,
} = require("../controllers/customer-auth.controller");

const {
  authCustomerJwt,
} = require("../middlewares/authCustomerJwt");

router.post("/register", registerCustomerController);
router.post("/login", loginCustomerController);

router.get(
  "/me",
  authCustomerJwt,
  meCustomerController
);

router.post(
  "/logout",
  authCustomerJwt,
  logoutCustomerController
);

module.exports = router;
