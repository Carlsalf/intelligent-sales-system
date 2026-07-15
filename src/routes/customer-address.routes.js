const router = require("express").Router();

const {
  authCustomerJwt,
} = require("../middlewares/authCustomerJwt");

const {
  listCustomerAddresses,
  getCustomerAddress,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
} = require(
  "../controllers/customer-address.controller"
);

router.use(authCustomerJwt);

router.get("/", listCustomerAddresses);

router.get(
  "/:id_direccion",
  getCustomerAddress
);

router.post(
  "/",
  createCustomerAddress
);

router.put(
  "/:id_direccion",
  updateCustomerAddress
);

router.patch(
  "/:id_direccion/default",
  setDefaultCustomerAddress
);

router.delete(
  "/:id_direccion",
  deleteCustomerAddress
);

module.exports = router;
