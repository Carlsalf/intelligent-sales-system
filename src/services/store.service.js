const repository = require("../repositories/store.repo");

function optionalPositiveInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} debe ser un entero mayor que cero.`);
    error.status = 400;
    throw error;
  }

  return parsed;
}

function requiredPositiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} debe ser un entero mayor que cero.`);
    error.status = 400;
    throw error;
  }

  return parsed;
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .slice(0, 100);
}

async function getProducts(query = {}) {
  const search = normalizeSearch(query.search);
  const categoryId = optionalPositiveInteger(
    query.category || query.id_categoria,
    "category"
  );

  const products = await repository.listProducts({
    search,
    categoryId,
  });

  return {
    products,
    total: products.length,
    filters: {
      search,
      category: categoryId,
    },
  };
}

async function getProductById(id) {
  const productId = requiredPositiveInteger(id, "id_producto");
  const product = await repository.findProductById(productId);

  if (!product) {
    const error = new Error("Producto no encontrado.");
    error.status = 404;
    throw error;
  }

  return product;
}

async function getCategories() {
  const categories = await repository.listCategories();

  return {
    categories,
    total: categories.length,
  };
}

module.exports = {
  getProducts,
  getProductById,
  getCategories,
};
