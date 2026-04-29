const express = require("express");
const router = express.Router();
const purchaseOrdersController = require("./purchase-orders.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/", authMiddleware, purchaseOrdersController.getAll);
router.get("/:id", authMiddleware, purchaseOrdersController.getById);
router.post(
  "/",
  authMiddleware,
  checkRole("admin", "manager"),
  purchaseOrdersController.create,
);
router.put(
  "/:id",
  authMiddleware,
  checkRole("admin", "manager"),
  purchaseOrdersController.updateStatus,
);
router.post(
  "/:id/receive",
  authMiddleware,
  checkRole("admin", "manager"),
  purchaseOrdersController.receive,
);

module.exports = router;
