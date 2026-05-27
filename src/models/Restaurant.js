const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VALIDATION_MESSAGES } = require("../constants/constants");

const RM = VALIDATION_MESSAGES.RESTAURANT;

const restaurantSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, RM.PROPERTY_REQUIRED],
    },
    name: {
      type: String,
      required: [true, RM.NAME_REQUIRED],
      trim: true,
    },
    description: {
      type: String,
      required: [true, RM.DESCRIPTION_REQUIRED],
      trim: true,
    },
    cuisineType: {
      type: String,
      required: [true, RM.CUISINE_REQUIRED],
      trim: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Restaurant", restaurantSchema);
