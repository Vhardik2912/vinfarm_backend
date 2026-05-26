const mongoose = require("mongoose");
const {
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_STATUS,
} = require("../constants/booking");

const bookingSchema = new mongoose.Schema(
  {
    // ─── Who booked ─────────────────────────────
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingSource: {
      type: String,
      enum: ["SELF", "STAFF"],
      required: true,
    },

    // ─── Room Info ──────────────────────────────
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    roomSnapshot: {
      roomName: String,
      pricePerNight: Number,
      capacity: Number,
    },

    // ─── Guests ─────────────────────────────────
    guests: {
      adults: { type: Number, required: true },
      children: { type: Number, default: 0 },
    },

    totalGuests: {
      type: Number,
      required: true,
    },

    // ─── Dates ──────────────────────────────────
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    actualCheckIn: Date,
    actualCheckOut: Date,

    // ─── Services (Normalized) ───────────────────
    services: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        total: Number,
      },
    ],

    // ─── Pricing Breakdown ──────────────────────
    pricing: {
      baseAmount: { type: Number, required: true },
      serviceAmount: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },

      finalAmount: { type: Number, required: true },
    },

    discountCode: String,

    // ─── Status ─────────────────────────────────
    bookingStatus: {
      type: String,
      enum: Object.values(ROOM_BOOKING_STATUS),
      default: ROOM_BOOKING_STATUS.PENDING,
    },

    // ─── Payment ────────────────────────────────
    payment: {
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
      },
      method: String,
      transactionId: String,
      paidAt: Date,
    },

    // ─── Cancellation / Refund ─────────────────
    cancellation: {
      reason: String,
      cancelledAt: Date,
    },

    refund: {
      amount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: Object.values(REFUND_STATUS),
        default: REFUND_STATUS.NONE,
      },
      processedAt: Date,
    },

    // ─── Flags ─────────────────────────────────
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Virtual ──────────────────────────────────
bookingSchema.virtual("numberOfNights").get(function () {
  if (this.checkInDate && this.checkOutDate) {
    return Math.ceil(
      (this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24)
    );
  }
  return 0;
});

module.exports = mongoose.model("Booking", bookingSchema);
