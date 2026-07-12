const router = require("express").Router();
const controller = require("../controllers/store.controller");

router.get("/products", controller.listProducts);
router.get("/products/:id", controller.getProduct);
router.get("/categories", controller.listCategories);

module.exports = router;
