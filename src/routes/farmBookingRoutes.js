const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getFarmBookings,
  getFarmBooking,
  createFarmBooking,
  updateFarmBooking,
  deleteFarmBooking,
} = require("../controllers/farmBookingController");

const router = express.Router();

// ─── Apply auth middleware to all farm booking routes ─────────────────────────
router.use(protect);

router.get("/get", getFarmBookings);
router.get("/getid/:id", getFarmBooking);
router.post("/getid", getFarmBooking);
router.post("/post", createFarmBooking);
router.put("/put/:id", updateFarmBooking);
router.delete("/delete/:id", deleteFarmBooking);

module.exports = router;
