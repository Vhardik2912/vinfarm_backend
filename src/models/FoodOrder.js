const mongoose = require("mongoose");
const { Schema } = mongoose;
const { VALIDATION_MESSAGES, FOOD_ORDER_STATUS, PAYMENT_STATUS } = require("../constants/constants");

const FO = VALIDATION_MESSAGES.FOOD_ORDER;

const foodOrderItemSchema = new Schema(
  {
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "RestaurantMenu",
      required: [true, FO.ITEM_MENU_REQUIRED],
    },
    price: {
      type: Number,
      required: [true, FO.ITEM_PRICE_REQUIRED],
      min: [0, "Item price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, FO.ITEM_QUANTITY_REQUIRED],
      min: [1, "Quantity must be at least 1"],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const foodOrderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, FO.CUSTOMER_REQUIRED],
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, FO.RESTAURANT_REQUIRED],
    },
    items: {
      type: [foodOrderItemSchema],
      required: [true, FO.ITEMS_REQUIRED],
      validate: [
        {
          validator: function (val) {
            return val && val.length > 0;
          },
          message: "Order must contain at least one item",
        },
      ],
    },
    orderStatus: {
      type: String,
      enum: Object.values(FOOD_ORDER_STATUS),
      default: FOOD_ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    specialRequest: {
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

module.exports = mongoose.model("FoodOrder", foodOrderSchema);
