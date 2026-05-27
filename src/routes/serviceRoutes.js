const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createServiceSchema, updateServiceSchema } = require("../validations/validationSchemas");
const { getServices, getService, createService, updateService, deleteService } = require("../controllers/serviceController");

const router = express.Router();

router.get("/get", getServices);
router.get("/getid/:id", getService);
router.post("/post", protect, validate(createServiceSchema), createService);
router.put("/put/:id", protect, validate(updateServiceSchema), updateService);
router.delete("/delete/:id", protect, deleteService);

module.exports = router;
