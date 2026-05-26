const mongoose = require("mongoose");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION_MESSAGES.ROLE.NAME_REQUIRED],
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

module.exports = mongoose.model("Role", roleSchema);
