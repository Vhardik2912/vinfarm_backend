const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VALIDATION_MESSAGES, MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require("../constants/constants");

const MN = VALIDATION_MESSAGES.MAINTENANCE;

const maintenanceSchema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, MN.ROOM_REQUIRED],
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, MN.REPORTED_BY_REQUIRED],
    },
    issueType: {
      type: String,
      required: [true, MN.ISSUE_TYPE_REQUIRED],
      trim: true,
    },
    description: {
      type: String,
      required: [true, MN.DESCRIPTION_REQUIRED],
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(MAINTENANCE_PRIORITY),
      default: MAINTENANCE_PRIORITY.MEDIUM,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PENDING,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
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

module.exports = mongoose.model("Maintenance", maintenanceSchema);
