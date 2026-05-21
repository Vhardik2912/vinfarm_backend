const mongoose = require("mongoose");
const { ROOM_TYPES, VALIDATION_MESSAGES, CUSTOMER_STATUS } = require("../constants/constants");

const customerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One-to-one mapping with User
    },

    address: {
      type: String,
      default: "",
    },


    roomType: {
      type: String,
      required: [true, VALIDATION_MESSAGES.CUSTOMER.ROOM_TYPE_REQUIRED],
      enum: {
        values: ROOM_TYPES,
        message: `Room type must be one of: ${ROOM_TYPES.join(", ")}`,
      },
    },

    checkIn: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.CUSTOMER.CHECKIN_REQUIRED],
    },

    checkOut: {
      type: Date,
      required: [true, VALIDATION_MESSAGES.CUSTOMER.CHECKOUT_REQUIRED],
    },

    // ─── Website Booking Fields ──────────────────────────────────────────────────
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    country: {
      type: String,
      default: "India",
    },
    numberOfGuests: {
      type: String,
      default: "1 Person",
    },

    // ─── Document (optional for website bookings, required for admin-created) ────
    document: {
      type: String,
      default: null,
    },

    price: {
      type: Number,
      default: 0,
    },

    // ─── Booking Source ──────────────────────────────────────────────────────────
    source: {
      type: String,
      enum: ["admin", "website"],
      default: "admin",
    },

    // ─── Email Tracking ─────────────────────────────────────────────────────────
    emailSentToCustomer: {
      type: Boolean,
      default: false,
    },
    emailSentToAdmin: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      required: [true, VALIDATION_MESSAGES.CUSTOMER.STATUS_REQUIRED],
      enum: {
        values: Object.values(CUSTOMER_STATUS),
        message: `Status must be one of: ${Object.values(CUSTOMER_STATUS).join(", ")}`,
      },
      default: CUSTOMER_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerProfile", customerProfileSchema);
