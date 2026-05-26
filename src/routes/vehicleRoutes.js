const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createVehicleSchema, updateVehicleSchema } = require("../validations/validationSchemas");
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");

const router = express.Router();

// ─── Apply auth middleware to all vehicle routes ─────────────────────────────────
router.use(protect);

router.get("/get", getVehicles);
router.get("/getid/:id", getVehicle);
router.post("/post", upload.array("document"), validate(createVehicleSchema), createVehicle);
router.put("/put/:id", upload.array("document"), validate(updateVehicleSchema), updateVehicle);
router.delete("/delete/:id", deleteVehicle);

module.exports = router;
