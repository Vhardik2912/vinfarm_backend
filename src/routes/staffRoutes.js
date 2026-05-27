const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createStaffSchema, updateStaffSchema } = require("../validations/validationSchemas");
const { getStaffs, getStaff, createStaff, updateStaff, deleteStaff } = require("../controllers/staffController");

const router = express.Router();

router.get("/get", protect, getStaffs);
router.get("/getid/:id", protect, getStaff);
router.post("/post", protect, upload.single("idProof"), validate(createStaffSchema), createStaff);
router.put("/put/:id", protect, upload.single("idProof"), validate(updateStaffSchema), updateStaff);
router.delete("/delete/:id", protect, deleteStaff);

module.exports = router;
