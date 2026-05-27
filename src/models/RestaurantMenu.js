const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VALIDATION_MESSAGES } = require("../constants/constants");

const RM = VALIDATION_MESSAGES.RESTAURANT_MENU;

const restaurantMenuSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, RM.RESTAURANT_REQUIRED],
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
    price: {
      type: Number,
      required: [true, RM.PRICE_REQUIRED],
      min: [0, "Price cannot be negative"],
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
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

module.exports = mongoose.model("RestaurantMenu", restaurantMenuSchema);
