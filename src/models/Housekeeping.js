const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VALIDATION_MESSAGES } = require("../constants/constants");

const HK = VALIDATION_MESSAGES.HOUSEKEEPING;

const housekeepingStaffSchema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const housekeepingSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, HK.ROOM_REQUIRED],
    },
    taskType: {
      type: String,
      required: [true, HK.TASK_TYPE_REQUIRED],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, HK.SCHEDULED_DATE_REQUIRED],
    },
    staff: {
      type: [housekeepingStaffSchema],
      default: [],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, HK.ASSIGNED_BY_REQUIRED],
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

module.exports = mongoose.model("Housekeeping", housekeepingSchema);
