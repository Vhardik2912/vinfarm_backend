const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate   = require("../middleware/validate");
const {
  createVehicleBookingSchema,
  updateVehicleBookingSchema,
} = require("../validations/vehicleBookingValidation");
const {
  getVehicleBookings,
  getVehicleBooking,
  createVehicleBooking,
  updateVehicleBooking,
  assignVehicleBooking,
  updateVehicleBookingStatus,
  deleteVehicleBooking,
} = require("../controllers/vehicleBookingController");

const router = express.Router();

// ─── Auth guard on all routes ──────────────────────────────────
router.use(protect);

// ─── Standard CRUD ─────────────────────────────────────────────
router.get("/get",         getVehicleBookings);
router.get("/getid/:id",   getVehicleBooking);
router.post("/post",       validate(createVehicleBookingSchema), createVehicleBooking);
router.put("/put/:id",     validate(updateVehicleBookingSchema), updateVehicleBooking);
router.delete("/delete/:id", deleteVehicleBooking);

// ─── Special Actions ────────────────────────────────────────────
router.put("/assign/:id",  assignVehicleBooking);       // Assign staff driver
router.put("/status/:id",  updateVehicleBookingStatus); // Change trip status

module.exports = router;
