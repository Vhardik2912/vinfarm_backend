const mongoose = require("mongoose");
const {
  MAINTENANCE_ISSUE_TYPES,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_STATUS,
  VALIDATION_MESSAGES,
} = require("../constants/constants");

const maintenanceSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, VALIDATION_MESSAGES.MAINTENANCE.REPORTER_REQUIRED],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    issueType: {
      type: String,
      required: [true, VALIDATION_MESSAGES.MAINTENANCE.ISSUE_TYPE_REQUIRED],
      enum: MAINTENANCE_ISSUE_TYPES,
    },
    description: {
      type: String,
      required: [true, VALIDATION_MESSAGES.MAINTENANCE.DESCRIPTION_REQUIRED],
      trim: true,
    },
    priority: {
      type: String,
      enum: MAINTENANCE_PRIORITY,
      default: "Medium",
    },
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PENDING,
    },
    assignedTechnicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    repairHistory: [
      {
        status: {
          type: String,
          enum: Object.values(MAINTENANCE_STATUS),
        },
        notes: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

maintenanceSchema.pre("save", function (next) {
  if (this.isNew && this.repairHistory.length === 0) {
    this.repairHistory.push({
      status: this.status,
      notes: "Maintenance created successfully.",
      updatedBy: this.reportedBy,
      updatedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);
