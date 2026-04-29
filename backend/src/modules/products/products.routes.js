const express = require("express");
const router = express.Router();
const productsController = require("./products.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/categories", authMiddleware, productsController.getCategories);
router.post(
  "/categories",
  authMiddleware,
  checkRole("admin", "manager"),
  productsController.createCategory,
);

router.get("/", authMiddleware, productsController.getAll);
router.get("/:id", authMiddleware, productsController.getById);
router.post(
  "/",
  authMiddleware,
  checkRole("admin", "manager"),
  productsController.create,
);
router.put(
  "/:id",
  authMiddleware,
  checkRole("admin", "manager"),
  productsController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  productsController.remove,
);

module.exports = router;
