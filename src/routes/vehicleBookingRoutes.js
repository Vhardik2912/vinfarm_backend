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

// ─── Standard CRUD ─────────────────────────────────────────────
router.get("/get",         protect, getVehicleBookings);
router.get("/getid/:id",   protect, getVehicleBooking);
router.post("/post",       protect, validate(createVehicleBookingSchema), createVehicleBooking);
router.put("/put/:id",     protect, validate(updateVehicleBookingSchema), updateVehicleBooking);
router.delete("/delete/:id", protect, deleteVehicleBooking);

// ─── Special Actions ────────────────────────────────────────────
router.put("/assign/:id",  protect, assignVehicleBooking);       // Assign staff driver
router.put("/status/:id",  protect, updateVehicleBookingStatus); // Change trip status

module.exports = router;
