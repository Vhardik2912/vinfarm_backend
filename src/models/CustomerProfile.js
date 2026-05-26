const mongoose = require("mongoose");
const { VALIDATION_MESSAGES } = require("../constants/constants");

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
    document: {
      type: String,
      default: null,
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

module.exports = mongoose.model("CustomerProfile", customerProfileSchema);
