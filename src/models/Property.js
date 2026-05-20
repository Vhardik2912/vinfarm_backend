const mongoose = require("mongoose");
const { PROPERTY_TYPES, VALIDATION_MESSAGES } = require("../constants/constants");

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION_MESSAGES.PROPERTY.NAME_REQUIRED],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, VALIDATION_MESSAGES.PROPERTY.TYPE_REQUIRED],
      enum: PROPERTY_TYPES,
      default: "Resort",
    },
    location: {
      type: String,
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

module.exports = mongoose.model("Property", propertySchema);
