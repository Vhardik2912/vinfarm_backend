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

// ─── 5 Standard CRUD Routes ───────────────────────────────────────────────────
router.get("/get", protect, getBookings);
router.get("/getid/:id", protect, getBooking);
router.post("/post", protect, validate(createBookingSchema), createBooking);
router.put("/put/:id", protect, validate(updateBookingSchema), updateBooking);
router.delete("/delete/:id", protect, cancelBooking);

// ─── Special Booking Actions ──────────────────────────────────────────────────
router.put("/confirm/:id", protect, confirmBooking);       // Approve pending booking
router.put("/checkin/:id", protect, checkIn);              // Check-in guest
router.put("/checkout/:id", protect, checkOut);            // Check-out guest
router.put("/payment/:id", protect, recordPayment);        // Mark payment as paid
router.put("/refund/:id", protect, processRefund);         // Process refund

// ─── Live Availability (Public) ──────────────────────────────────────────────
router.get("/availability", getRoomAvailability); // ?checkInDate=...&checkOutDate=...

module.exports = router;
