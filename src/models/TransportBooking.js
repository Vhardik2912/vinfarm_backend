const mongoose = require("mongoose");
const { TRANSPORT_BOOKING_TYPE, TRANSPORT_BOOKING_STATUS, VALIDATION_MESSAGES } = require("../constants/constants");

const transportBookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, VALIDATION_MESSAGES.TRANSPORT_BOOKING.CUSTOMER_REQUIRED],
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, VALIDATION_MESSAGES.TRANSPORT_BOOKING.VEHICLE_REQUIRED],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    bookingType: {
      type: String,
      required: [true, VALIDATION_MESSAGES.TRANSPORT_BOOKING.TYPE_REQUIRED],
      enum: TRANSPORT_BOOKING_TYPE,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },
    pickupDateTime: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.TRANSPORT_BOOKING.PICKUP_TIME_REQUIRED],
    },
    returnDateTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TRANSPORT_BOOKING_STATUS),
      default: TRANSPORT_BOOKING_STATUS.PENDING,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TransportBooking", transportBookingSchema);
