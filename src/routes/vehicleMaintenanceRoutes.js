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

// Apply auth middleware to all vehicle maintenance routes
router.use(protect);

router.get("/get", getVehicleMaintenances);
router.get("/getid/:id", getVehicleMaintenance);
router.post(
  "/post",
  upload.single("bill"),
  validate(createVehicleMaintenanceSchema),
  createVehicleMaintenance
);
router.put(
  "/put/:id",
  upload.single("bill"),
  validate(updateVehicleMaintenanceSchema),
  updateVehicleMaintenance
);
router.put("/resolve/:id", resolveVehicleMaintenance);
router.delete("/delete/:id", deleteVehicleMaintenance);

module.exports = router;
