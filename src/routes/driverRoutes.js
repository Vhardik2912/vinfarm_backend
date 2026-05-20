const express = require("express");
const validate = require("../middleware/validate");
const { createDriverSchema, updateDriverSchema } = require("../validations/validationSchemas");
const { getDrivers, getDriver, createDriver, updateDriver, deleteDriver } = require("../controllers/driverController");

const router = express.Router();

router.get("/get", getDrivers);
router.get("/getid/:id", getDriver);
router.post("/post", validate(createDriverSchema), createDriver);
router.put("/put/:id", validate(updateDriverSchema), updateDriver);
router.delete("/delete/:id", deleteDriver);

module.exports = router;
