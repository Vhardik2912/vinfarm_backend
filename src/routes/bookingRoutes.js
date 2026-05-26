const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createBookingSchema, updateBookingSchema } = require("../validations/bookingValidation");
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  checkIn,
  checkOut,
  recordPayment,
  processRefund,
  getRoomAvailability,
} = require("../controllers/bookingController");

const router = express.Router();

// ─── Apply auth middleware to all booking routes ──────────────────────────────
router.use(protect);

// ─── 5 Standard CRUD Routes ───────────────────────────────────────────────────
router.get("/get", getBookings);
router.get("/getid/:id", getBooking);
router.post("/post", validate(createBookingSchema), createBooking);
router.put("/put/:id", validate(updateBookingSchema), updateBooking);
router.delete("/delete/:id", cancelBooking);

// ─── Special Booking Actions ──────────────────────────────────────────────────
router.put("/confirm/:id", confirmBooking);       // Approve pending booking
router.put("/checkin/:id", checkIn);              // Check-in guest
router.put("/checkout/:id", checkOut);            // Check-out guest
router.put("/payment/:id", recordPayment);        // Mark payment as paid
router.put("/refund/:id", processRefund);         // Process refund

// ─── Live Availability ────────────────────────────────────────────────────────
router.get("/availability", getRoomAvailability); // ?checkInDate=...&checkOutDate=...

module.exports = router;
