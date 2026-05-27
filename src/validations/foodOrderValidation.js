const Joi = require("joi");
const { FOOD_ORDER_STATUS, PAYMENT_STATUS } = require("../constants/constants");

const foodOrderItemValidationSchema = Joi.object({
  menuId: Joi.string().required(),
  price: Joi.number().min(0).optional(),
  quantity: Joi.number().integer().min(1).required(),
  notes: Joi.string().trim().optional().allow(""),
});

const createFoodOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  restaurantId: Joi.string().required(),
  propertyId: Joi.string().required(),
  items: Joi.array().items(foodOrderItemValidationSchema).min(1).required(),
  orderStatus: Joi.string().valid(...Object.values(FOOD_ORDER_STATUS)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PAYMENT_STATUS)).optional(),
  specialRequest: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

const updateFoodOrderSchema = Joi.object({
  customerId: Joi.string().optional(),
  restaurantId: Joi.string().optional(),
  propertyId: Joi.string().optional(),
  items: Joi.array().items(foodOrderItemValidationSchema).min(1).optional(),
  orderStatus: Joi.string().valid(...Object.values(FOOD_ORDER_STATUS)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PAYMENT_STATUS)).optional(),
  specialRequest: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createFoodOrderSchema,
  updateFoodOrderSchema,
};
