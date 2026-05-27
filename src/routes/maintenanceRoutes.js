const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} = require("../validations/maintenanceValidation");
const {
  getMaintenances,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  assignMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
} = require("../controllers/maintenanceController");

const router = express.Router();

router.get("/get", protect, getMaintenances);
router.get("/getid/:id", protect, getMaintenance);
router.post("/post", protect, validate(createMaintenanceSchema), createMaintenance);
router.put("/put/:id", protect, validate(updateMaintenanceSchema), updateMaintenance);
router.put("/assign/:id", protect, assignMaintenance);
router.put("/status/:id", protect, updateMaintenanceStatus);
router.delete("/delete/:id", protect, deleteMaintenance);

module.exports = router;
