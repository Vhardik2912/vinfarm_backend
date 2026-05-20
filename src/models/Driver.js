const mongoose = require("mongoose");
const { VALIDATION_MESSAGES, PATTERNS } = require("../constants/constants");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION_MESSAGES.DRIVER.NAME_REQUIRED],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, VALIDATION_MESSAGES.DRIVER.PHONE_REQUIRED],
      unique: true,
      trim: true,
      match: [
        PATTERNS.PHONE,
        "Please provide a valid phone number with optional country code",
      ],
    },
    country: {
      type: String,
      required: [true, VALIDATION_MESSAGES.DRIVER.COUNTRY_REQUIRED],
      trim: true,
      default: "India",
    },
    licenseNumber: {
      type: String,
      required: [true, VALIDATION_MESSAGES.DRIVER.LICENSE_REQUIRED],
      unique: true,
      trim: true,
      uppercase: true,
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

module.exports = mongoose.model("Driver", driverSchema);
