const express = require("express");
const cors = require("cors");

// Rutas
const authRoutes = require("./routes/auth.routes");
const meRoutes = require("./routes/me.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const clientRoutes = require("./routes/client.routes");
const saleRoutes = require("./routes/sale.routes");
const userManagementRoutes = require("./routes/user-management.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const cartRoutes = require("./routes/cart.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const storeRoutes = require("./routes/store.routes");
const customerAuthRoutes = require("./routes/customer-auth.routes");
const customerCartRoutes = require("./routes/customer-cart.routes");
const customerCheckoutRoutes = require("./routes/customer-checkout.routes");
const customerAddressRoutes = require("./routes/customer-address.routes");
const customerOrdersRoutes = require("./routes/customer-orders.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TFM PYME Ventas API");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "TFM PYME API running" });
});

// API
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/categorias", categoryRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/products", productRoutes);
app.use("/api/clientes", clientRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/ventas", saleRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", userManagementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/carrito", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/store/auth", customerAuthRoutes);
app.use("/api/store/cart", customerCartRoutes);
app.use("/api/store/checkout", customerCheckoutRoutes);
app.use("/api/store/addresses", customerAddressRoutes);
app.use("/api/store/orders", customerOrdersRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
