const mongoose = require("mongoose");
const { FARM_EVENT_TYPES, FARM_BOOKING_STATUS, FARM_PAYMENT_STATUS, VALIDATION_MESSAGES } = require("../constants/constants");

const farmBookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, VALIDATION_MESSAGES.FARM_BOOKING.CUSTOMER_REQUIRED],
    },
    startDate: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.FARM_BOOKING.START_DATE_REQUIRED],
    },
    endDate: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.FARM_BOOKING.END_DATE_REQUIRED],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    guestsCount: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.FARM_BOOKING.GUESTS_REQUIRED],
      min: [1, "Guests count must be at least 1"],
    },
    eventType: {
      type: String,
      enum: FARM_EVENT_TYPES,
      default: "Staycation",
    },
    addons: {
      swimmingPool: { type: Boolean, default: false },
      catering: { type: Boolean, default: false },
      liveDJ: { type: Boolean, default: false },
      bonfire: { type: Boolean, default: false },
      decoration: { type: Boolean, default: false },
    },
    basePrice: {
      type: Number,
      required: true,
    },
    addonPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(FARM_BOOKING_STATUS),
      default: FARM_BOOKING_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(FARM_PAYMENT_STATUS),
      default: FARM_PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      default: "Cash",
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    status: {
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

module.exports = mongoose.model("FarmBooking", farmBookingSchema);
