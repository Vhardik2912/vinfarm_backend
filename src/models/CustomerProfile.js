const mongoose = require("mongoose");

const customerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One-to-one mapping with User
    },
    // remove roleid
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    address: {
      type: String,
      default: "",
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    // remove bookingHistory
    bookingHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking", // Reference to future booking collection
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerProfile", customerProfileSchema);
