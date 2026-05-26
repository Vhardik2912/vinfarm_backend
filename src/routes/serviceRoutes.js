const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createServiceSchema, updateServiceSchema } = require("../validations/validationSchemas");
const { getServices, getService, createService, updateService, deleteService } = require("../controllers/serviceController");

const router = express.Router();

// ─── Apply auth middleware to all service routes ─────────────────────────────────
router.use(protect);

router.get("/get", getServices);
router.get("/getid/:id", getService);
router.post("/post", validate(createServiceSchema), createService);
router.put("/put/:id", validate(updateServiceSchema), updateService);
router.delete("/delete/:id", deleteService);

module.exports = router;
