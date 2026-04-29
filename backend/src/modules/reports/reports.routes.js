const express = require("express");
const router = express.Router();
const reportsController = require("./reports.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/dashboard", authMiddleware, reportsController.getDashboard);
router.get(
  "/stock-movement",
  authMiddleware,
  checkRole("admin", "manager"),
  reportsController.getStockMovement,
);
router.get(
  "/po-summary",
  authMiddleware,
  checkRole("admin", "manager"),
  reportsController.getPOSummary,
);

module.exports = router;
