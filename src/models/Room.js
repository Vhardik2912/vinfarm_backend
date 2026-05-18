const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Please add a room number or ID"],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, "Please specify a room type"],
      enum: ["Family", "Bachelor", "Tent", "VIP Room"],
      default: "Family",
    },
    basePrice: {
      type: Number,
      required: [true, "Please add a base price"],
    },
    bookingStatus: {
      type: String,
      required: [true, "Please add booking status"],
      enum: ["Available", "Booked", "Reserved", "Maintenance"],
      default: "Available",
    },
    cleaningStatus: {
      type: String,
      required: [true, "Please add cleaning status"],
      enum: ["Clean", "Dirty", "Cleaning"],
      default: "Clean",
    },
    status: {
      type: Boolean,
      default: true, // true = active (on), false = inactive (off)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);
