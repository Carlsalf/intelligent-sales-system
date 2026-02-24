const express = require("express");
const cors = require("cors");

// Rutas
const authRoutes = require("./routes/auth.routes");
const meRoutes = require("./routes/me.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const clientRoutes = require("./routes/client.routes");
const saleRoutes = require("./routes/sale.routes");

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
app.use("/api/clientes", clientRoutes);
app.use("/api/ventas", saleRoutes);

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
