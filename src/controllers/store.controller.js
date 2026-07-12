const service = require("../services/store.service");

async function listProducts(req, res, next) {
  try {
    const result = await service.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const result = await service.getProductById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function listCategories(req, res, next) {
  try {
    const result = await service.getCategories();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  listCategories,
};
