const express = require("express");
const router = express.Router();
const stockController = require("./stock.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/", authMiddleware, stockController.getAll);
router.get("/check", authMiddleware, stockController.check);
router.get("/history", authMiddleware, stockController.getHistory);
router.post(
  "/mutate",
  authMiddleware,
  checkRole("admin", "manager"),
  stockController.mutate,
);

module.exports = router;
