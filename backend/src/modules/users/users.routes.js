const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/", authMiddleware, checkRole("admin"), usersController.getAll);
router.get("/:id", authMiddleware, checkRole("admin"), usersController.getById);
router.post("/", authMiddleware, checkRole("admin"), usersController.create);
router.put("/:id", authMiddleware, checkRole("admin"), usersController.update);
router.put(
  "/:id/reset-password",
  authMiddleware,
  checkRole("admin"),
  usersController.resetPassword,
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  usersController.remove,
);

module.exports = router;
