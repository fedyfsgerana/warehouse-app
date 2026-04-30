const express = require("express");
const router = express.Router();
const suppliersController = require("./suppliers.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/", authMiddleware, suppliersController.getAll);
router.get("/:id", authMiddleware, suppliersController.getById);
router.post(
  "/",
  authMiddleware,
  checkRole("admin", "manager"),
  suppliersController.create,
);
router.put(
  "/:id",
  authMiddleware,
  checkRole("admin", "manager"),
  suppliersController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  suppliersController.remove,
);

module.exports = router;
