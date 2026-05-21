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
    loyaltyPoints: {
      type: Number,
      default: 0,
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

    document: {
      type: String,
      required: [true, VALIDATION_MESSAGES.CUSTOMER.DOCUMENT_REQUIRED],
    },

    price: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.CUSTOMER.PRICE_REQUIRED],
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
