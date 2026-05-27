const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createVehicleSchema, updateVehicleSchema } = require("../validations/validationSchemas");
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");

const router = express.Router();

router.get("/get", protect, getVehicles);
router.get("/getid/:id", protect, getVehicle);
router.post("/post", protect, upload.array("document"), validate(createVehicleSchema), createVehicle);
router.put("/put/:id", protect, upload.array("document"), validate(updateVehicleSchema), updateVehicle);
router.delete("/delete/:id", protect, deleteVehicle);

module.exports = router;
