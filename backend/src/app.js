const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/products/products.routes");
const warehouseRoutes = require("./modules/warehouses/warehouses.routes");
const stockRoutes = require("./modules/stock/stock.routes");
const purchaseOrderRoutes = require("./modules/purchase-orders/purchase-orders.routes");
const salesOrderRoutes = require("./modules/sales-orders/sales-orders.routes");
const reportRoutes = require("./modules/reports/reports.routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({ message: "✅ Warehouse API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
