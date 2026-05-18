const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  getStaffs,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

const router = express.Router();

// Using ONLY GET and POST HTTP Methods
router.post("/post", upload.single("idProof"), createStaff);
router.get("/get", getStaffs);
router.post("/getid", getStaff);
router.post("/put", upload.single("idProof"), updateStaff);
router.post("/delete", deleteStaff);

module.exports = router;
