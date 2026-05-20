const mongoose = require("mongoose");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION_MESSAGES.DESIGNATION.NAME_REQUIRED],
      unique: true,
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

module.exports = mongoose.model("Designation", designationSchema);
