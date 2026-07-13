import axios from "axios";

const storeApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchStoreProducts({
  search = "",
  category = "",
} = {}) {
  const response = await storeApi.get("/store/products", {
    params: {
      search: search || undefined,
      category: category || undefined,
    },
  });

  return response.data;
}

export async function fetchStoreCategories() {
  const response = await storeApi.get("/store/categories");
  return response.data;
}

export async function fetchStoreProduct(id) {
  const response = await storeApi.get(`/store/products/${id}`);
  return response.data;
}

export default storeApi;
