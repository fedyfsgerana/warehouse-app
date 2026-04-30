const express = require("express");
const router = express.Router();
const menusController = require("./menus.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/my-menus", authMiddleware, menusController.getByRole);

router.get("/", authMiddleware, checkRole("admin"), menusController.getAll);
router.post("/", authMiddleware, checkRole("admin"), menusController.create);
router.put(
  "/order",
  authMiddleware,
  checkRole("admin"),
  menusController.updateOrder,
);
router.put("/:id", authMiddleware, checkRole("admin"), menusController.update);
router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  menusController.remove,
);

module.exports = router;
