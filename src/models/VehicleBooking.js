const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VEHICLE_BOOKING_STATUS } = require("../constants/booking");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const VM = VALIDATION_MESSAGES.VEHICLE_BOOKING;

/* ─── Vehicle Booking Schema ─────────────────────────── */
const vehicleBookingSchema = new Schema(
  {
    // ─── References ───────────────────────────────────
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, VM.VEHICLE_REQUIRED],
    },


    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, VM.CUSTOMER_REQUIRED],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, VM.CREATED_BY_REQUIRED],
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ─── Trip Details ──────────────────────────────────
    pickupPoint: {
      type: String,
      required: [true, VM.PICKUP_POINT_REQUIRED],
      trim: true,
    },

    dropPoint: {
      type: String,
      required: [true, VM.DROP_POINT_REQUIRED],
      trim: true,
    },

    pickupTime: {
      type: Date,
      required: [true, VM.PICKUP_TIME_REQUIRED],
    },

    dropTime: {
      type: Date,
      default: null,
    },

    // ─── Pricing & Status ─────────────────────────────
    price: {
      type: Number,
      required: [true, VM.PRICE_REQUIRED],
      min: [0, "Price cannot be negative"],
    },

    status: {
      type: String,
      enum: Object.values(VEHICLE_BOOKING_STATUS),
      default: VEHICLE_BOOKING_STATUS.PENDING,
    },

    // ─── Flags ────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleBooking", vehicleBookingSchema);
