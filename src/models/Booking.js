const mongoose = require("mongoose");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS } = require("../constants/booking");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const bookingSchema = new mongoose.Schema(
  {
    // ─── References ─────────────────────────────────────────────────────────────
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, VALIDATION_MESSAGES.BOOKING.CUSTOMER_REQUIRED],
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, VALIDATION_MESSAGES.BOOKING.ROOM_REQUIRED],
    },

    // ─── Room Info (Denormalized for snapshot) ───────────────────────────────────
    roomNumber: {
      type: String,
      required: [true, VALIDATION_MESSAGES.BOOKING.ROOM_NUMBER_REQUIRED],
    },
    roomType: {
      type: String,
      required: [true, VALIDATION_MESSAGES.BOOKING.ROOM_TYPE_REQUIRED],
    },

    // ─── Guest Info ──────────────────────────────────────────────────────────────
    numberOfGuests: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.BOOKING.GUESTS_REQUIRED],
      min: [1, "At least 1 guest is required"],
    },
    isGroupBooking: {
      type: Boolean,
      default: false,
    },
    groupSize: {
      type: Number,
      default: 1,
    },
    specialRequests: {
      type: String,
      default: "",
    },

    // ─── Check-In / Check-Out ────────────────────────────────────────────────────
    checkInDate: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.BOOKING.CHECKIN_REQUIRED],
    },
    checkOutDate: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.BOOKING.CHECKOUT_REQUIRED],
    },
    actualCheckIn: {
      type: Date,
      default: null,
    },
    actualCheckOut: {
      type: Date,
      default: null,
    },

    // ─── Extra Services ──────────────────────────────────────────────────────────
    extraServices: {
      type: [String],
      default: [],
    },
    extraServicesAmount: {
      type: Number,
      default: 0,
    },

    // ─── Pricing ─────────────────────────────────────────────────────────────────
    baseAmount: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.BOOKING.BASE_AMOUNT_REQUIRED],
    },
    discountCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.BOOKING.TOTAL_AMOUNT_REQUIRED],
    },

    // ─── Booking Status ──────────────────────────────────────────────────────────
    bookingStatus: {
      type: String,
      enum: Object.values(ROOM_BOOKING_STATUS),
      default: ROOM_BOOKING_STATUS.PENDING,
    },

    // ─── Payment ─────────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null, // e.g. "Cash", "Card", "UPI", "Online"
    },

    // ─── Cancellation & Refund ───────────────────────────────────────────────────
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: Object.values(REFUND_STATUS),
      default: REFUND_STATUS.NONE,
    },
    refundProcessedAt: {
      type: Date,
      default: null,
    },

    // ─── Soft Delete ─────────────────────────────────────────────────────────────
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

// Virtual: number of nights
bookingSchema.virtual("numberOfNights").get(function () {
  if (this.checkInDate && this.checkOutDate) {
    const diff = this.checkOutDate - this.checkInDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

module.exports = mongoose.model("Booking", bookingSchema);
