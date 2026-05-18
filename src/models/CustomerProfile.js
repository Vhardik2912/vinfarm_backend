const mongoose = require("mongoose");

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
    bookingHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking", // Reference to future booking collection
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerProfile", customerProfileSchema);
