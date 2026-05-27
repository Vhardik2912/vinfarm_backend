const mongoose = require("mongoose");
const { Schema } = mongoose;

const {
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_STATUS,
  ROOM_TYPE,
} = require("../constants/booking");

/* ─── Accommodation Snapshot ───────────────── */
const AccommodationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["ROOM", "PROPERTY"],
      required: true,
    },
    roomType: {
      type: String,
      enum: Object.values(ROOM_TYPE),
      required: function () {
        return this.type === "ROOM";
      },
      default: null,
    },
    refId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
  },
  { _id: false }
);

/* ─── Guest Info ───────────────────────────── */
const GuestSchema = new Schema(
  {
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    totalGuests: { type: Number, required: true },
  },
  { _id: false }
);

/* ─── Date Info ───────────────────────────── */
const DateSchema = new Schema(
  {
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    actualCheckIn: { type: Date, default: null },
    actualCheckOut: { type: Date, default: null },
  },
  { _id: false }
);

/* ─── Services ───────────────────────────── */
// const ServiceSchema = new Schema(
//   {
//     serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
//     name: String,
//     price: Number,
//     quantity: { type: Number, default: 1 },
//     total: Number,
//   },
//   { _id: false }
// );

/* ─── Pricing ───────────────────────────── */
const PricingSchema = new Schema(
  {
    baseAmount: { type: Number, required: true },
    serviceAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
  },
  { _id: false }
);

/* ─── Payment ───────────────────────────── */
const PaymentSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    method: String,
    transactionId: String,
    paidAt: Date,
  },
  { _id: false }
);

/* ─── Cancellation ───────────────────────── */
const CancellationSchema = new Schema(
  {
    reason: String,
    cancelledAt: Date,
  },
  { _id: false }
);

/* ─── Refund ───────────────────────────── */
const RefundSchema = new Schema(
  {
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(REFUND_STATUS),
      default: REFUND_STATUS.NONE,
    },
    processedAt: Date,
  },
  { _id: false }
);

/* ─── MAIN BOOKING ───────────────────────── */
const bookingSchema = new Schema(
  {
    // ─── User Info ─────────────────────
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingSource: {
      type: String,
      enum: ["SELF", "STAFF"],
      required: true,
    },

    // ─── Accommodation ────────────────
    accommodation: {
      type: AccommodationSchema,
      required: true,
    },

    // ─── Guests ──────────────────────
    guests: {
      type: GuestSchema,
      required: true,
    },

    // ─── Dates ───────────────────────
    dates: {
      type: DateSchema,
      required: true,
    },

    // ─── Services ────────────────────
    // services: {
    //   type: [ServiceSchema],
    //   default: [],
    // },

    // ─── Pricing ─────────────────────
    pricing: {
      type: PricingSchema,
      required: true,
    },

    discountCode: String,

    // ─── Status ──────────────────────
    bookingStatus: {
      type: String,
      enum: Object.values(ROOM_BOOKING_STATUS),
      default: ROOM_BOOKING_STATUS.PENDING,
    },

    // ─── Payment ─────────────────────
    payment: {
      type: PaymentSchema,
      default: {},
    },

    // ─── Cancellation / Refund ──────
    cancellation: {
      type: CancellationSchema,
      default: {},
    },

    refund: {
      type: RefundSchema,
      default: {},
    },

    // ─── Flags ──────────────────────
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ─── Virtual ───────────────────────────── */
bookingSchema.virtual("numberOfNights").get(function () {
  const { checkInDate, checkOutDate } = this.dates || {};
  if (checkInDate && checkOutDate) {
    return Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
  }
  return 0;
});

module.exports = mongoose.model("Booking", bookingSchema);