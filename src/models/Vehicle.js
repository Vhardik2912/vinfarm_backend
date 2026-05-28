const mongoose = require("mongoose");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.NAME_REQUIRED],
      trim: true,
    },
    vehicleType: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.TYPE_REQUIRED],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.NUMBER_REQUIRED],
      unique: true,
      trim: true,
    },
    vehicleCapacity: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.VEHICLE.CAPACITY_REQUIRED],
      min: [1, "Vehicle capacity must be at least 1"],
    },
    document: {
      type: [String],
      default: [],
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

module.exports = mongoose.model("Vehicle", vehicleSchema);
