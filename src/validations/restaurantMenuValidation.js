const Joi = require("joi");

const createRestaurantMenuSchema = Joi.object({
  restaurantId: Joi.string().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  isVeg: Joi.boolean().optional().default(false),
  isActive: Joi.boolean().optional().default(true),
  image: Joi.string().optional().allow(null, ""),
});

const updateRestaurantMenuSchema = Joi.object({
  restaurantId: Joi.string().optional(),
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  price: Joi.number().min(0).optional(),
  isVeg: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  image: Joi.string().optional().allow(null, ""),
});

module.exports = {
  createRestaurantMenuSchema,
  updateRestaurantMenuSchema,
};
