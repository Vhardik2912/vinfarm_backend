const express = require("express");
const validate = require("../middleware/validate");
const { createMaintenanceSchema, updateMaintenanceSchema } = require("../validations/validationSchemas");
const { getMaintenances, getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } = require("../controllers/maintenanceController");

const router = express.Router();

router.get("/get", getMaintenances);
router.get("/getid/:id", getMaintenance);
router.post("/post", validate(createMaintenanceSchema), createMaintenance);
router.put("/put/:id", validate(updateMaintenanceSchema), updateMaintenance);
router.delete("/delete/:id", deleteMaintenance);

module.exports = router;
