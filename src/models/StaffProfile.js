const mongoose = require("mongoose");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const staffProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One-to-one mapping with User
    },

    designationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: false,
    },
    joinDate: {
      type: Date,
      required: [false, VALIDATION_MESSAGES.STAFF.JOIN_DATE_REQUIRED],
    },
    endDate: {
      type: Date,
      default: null,
    },
    salary: {
      type: Number,
      required: [false, VALIDATION_MESSAGES.STAFF.SALARY_REQUIRED],
    },
    idProof: {
      type: String, // Path of uploaded ID document
      required: [false, VALIDATION_MESSAGES.STAFF.ID_PROOF_REQUIRED],
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

module.exports = mongoose.model("StaffProfile", staffProfileSchema);
