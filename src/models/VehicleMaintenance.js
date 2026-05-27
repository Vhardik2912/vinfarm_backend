const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VALIDATION_MESSAGES } = require("../constants/constants");

const VM = VALIDATION_MESSAGES.VEHICLE_MAINTENANCE;

const vehicleMaintenanceSchema = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, VM.VEHICLE_REQUIRED],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, VM.CREATED_BY_REQUIRED],
    },
    title: {
      type: String,
      required: [true, VM.TITLE_REQUIRED],
      trim: true,
    },
    description: {
      type: String,
      required: [true, VM.DESCRIPTION_REQUIRED],
      trim: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedRemarks: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      required: [true, VM.AMOUNT_REQUIRED],
      min: [0, "Amount cannot be negative"],
    },
    bill: {
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

module.exports = mongoose.model("VehicleMaintenance", vehicleMaintenanceSchema);
