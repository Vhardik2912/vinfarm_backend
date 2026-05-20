const mongoose = require("mongoose");

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    maintenanceDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
    nextServiceOdometer: {
      type: Number,
      default: null,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MaintenanceLog", maintenanceLogSchema);
