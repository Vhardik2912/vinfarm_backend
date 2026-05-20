const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createTransportBookingSchema, updateTransportBookingSchema } = require("../validations/validationSchemas");
const { getBookings, getBooking, createBooking, updateBooking, deleteBooking } = require("../controllers/transportBookingController");

const router = express.Router();

// ─── Apply auth middleware to all transport booking routes ────────────────────
router.use(protect);

router.get("/get", getBookings);
router.get("/getid/:id", getBooking);
router.post("/post", validate(createTransportBookingSchema), createBooking);
router.put("/put/:id", validate(updateTransportBookingSchema), updateBooking);
router.delete("/delete/:id", deleteBooking);

module.exports = router;
