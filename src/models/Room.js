const mongoose = require("mongoose");
const { ROOM_TYPES, VALIDATION_MESSAGES } = require("../constants/constants");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, VALIDATION_MESSAGES.ROOM.NUMBER_REQUIRED],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, VALIDATION_MESSAGES.ROOM.TYPE_REQUIRED],
      enum: ROOM_TYPES,
      default: ROOM_TYPES[0],
    },
    basePrice: {
      type: Number,
      required: [true, VALIDATION_MESSAGES.ROOM.PRICE_REQUIRED],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, VALIDATION_MESSAGES.ROOM.PROPERTY_REQUIRED],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);
