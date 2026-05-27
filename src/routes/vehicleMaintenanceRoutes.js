const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const {
  createVehicleMaintenanceSchema,
  updateVehicleMaintenanceSchema,
} = require("../validations/vehicleMaintenanceValidation");
const {
  getVehicleMaintenances,
  getVehicleMaintenance,
  createVehicleMaintenance,
  updateVehicleMaintenance,
  resolveVehicleMaintenance,
  deleteVehicleMaintenance,
} = require("../controllers/vehicleMaintenanceController");

const router = express.Router();

router.get("/get", protect, getVehicleMaintenances);
router.get("/getid/:id", protect, getVehicleMaintenance);
router.post(
  "/post",
  protect,
  upload.single("bill"),
  validate(createVehicleMaintenanceSchema),
  createVehicleMaintenance
);
router.put(
  "/put/:id",
  protect,
  upload.single("bill"),
  validate(updateVehicleMaintenanceSchema),
  updateVehicleMaintenance
);
router.put("/resolve/:id", protect, resolveVehicleMaintenance);
router.delete("/delete/:id", protect, deleteVehicleMaintenance);

module.exports = router;
