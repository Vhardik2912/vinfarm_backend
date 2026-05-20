const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createVehicleSchema, updateVehicleSchema, createFuelLogSchema } = require("../validations/validationSchemas");
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, addFuelLog, getFuelLogs } = require("../controllers/vehicleController");

const router = express.Router();

// ─── Apply auth middleware to all vehicle routes ──────────────────────────────
router.use(protect);

// ─── Vehicle CRUD (5 standard routes) ────────────────────────────────────────
router.get("/get", getVehicles);
router.get("/getid/:id", getVehicle);
router.post("/post", upload.array("images", 5), validate(createVehicleSchema), createVehicle);
router.put("/put/:id", upload.array("images", 5), validate(updateVehicleSchema), updateVehicle);
router.delete("/delete/:id", deleteVehicle);

// ─── Fuel Log sub-routes ──────────────────────────────────────────────────────
router.get("/fuel/get", getFuelLogs);
router.post("/fuel/post", validate(createFuelLogSchema), addFuelLog);

module.exports = router;
