const express = require("express");
const router = express.Router();
const warehousesController = require("./warehouses.controller");
const authMiddleware = require("../../middleware/auth");
const checkRole = require("../../middleware/role");

router.get("/", authMiddleware, warehousesController.getAll);
router.get("/:id", authMiddleware, warehousesController.getById);
router.post(
  "/",
  authMiddleware,
  checkRole("admin", "manager"),
  warehousesController.create,
);
router.put(
  "/:id",
  authMiddleware,
  checkRole("admin", "manager"),
  warehousesController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  warehousesController.remove,
);

router.get("/:id/locations", authMiddleware, warehousesController.getLocations);
router.post(
  "/:id/locations",
  authMiddleware,
  checkRole("admin", "manager"),
  warehousesController.createLocation,
);

module.exports = router;
