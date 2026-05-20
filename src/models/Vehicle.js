const mongoose = require("mongoose");
const { VEHICLE_TYPES, VEHICLE_STATUS, VALIDATION_MESSAGES } = require("../constants/constants");

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.MAKE_REQUIRED],
      trim: true,
    },
    model: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.MODEL_REQUIRED],
      trim: true,
    },
    licensePlate: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.PLATE_REQUIRED],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, VALIDATION_MESSAGES.VEHICLE.TYPE_REQUIRED],
      enum: VEHICLE_TYPES,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    priceAirportTrip: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(VEHICLE_STATUS),
      default: VEHICLE_STATUS.AVAILABLE,
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
