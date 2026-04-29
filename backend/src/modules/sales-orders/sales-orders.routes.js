const express = require("express");
const router = express.Router();
const salesOrdersController = require("./sales-orders.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/", authMiddleware, salesOrdersController.getAll);
router.get("/:id", authMiddleware, salesOrdersController.getById);
router.post("/", authMiddleware, salesOrdersController.create);
router.put(
  "/:id/confirm",
  authMiddleware,
  checkRole("admin", "manager"),
  salesOrdersController.confirm,
);
router.put(
  "/:id/ship",
  authMiddleware,
  checkRole("admin", "manager"),
  salesOrdersController.ship,
);

module.exports = router;
