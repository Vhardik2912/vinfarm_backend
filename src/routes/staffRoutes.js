const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createStaffSchema, updateStaffSchema } = require("../validations/validationSchemas");
const { getStaffs, getStaff, createStaff, updateStaff, deleteStaff } = require("../controllers/staffController");

const router = express.Router();

router.get("/get", getStaffs);
router.get("/getid/:id", getStaff);
router.post("/post", upload.single("idProof"), validate(createStaffSchema), createStaff);
router.put("/put/:id", upload.single("idProof"), validate(updateStaffSchema), updateStaff);
router.delete("/delete/:id", deleteStaff);

module.exports = router;
