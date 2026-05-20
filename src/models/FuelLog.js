const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    fuelQuantity: {
      type: Number,
      required: true, // in liters
      min: 0.1,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    odometerReading: {
      type: Number,
      required: true,
      min: 0,
    },
    filledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FuelLog", fuelLogSchema);
