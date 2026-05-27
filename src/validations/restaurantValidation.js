const Joi = require("joi");

const createRestaurantSchema = Joi.object({
  propertyId: Joi.string().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  cuisineType: Joi.string().trim().required(),
  isVeg: Joi.boolean().optional().default(false),
  isActive: Joi.boolean().optional().default(true),
});

const updateRestaurantSchema = Joi.object({
  propertyId: Joi.string().optional(),
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  cuisineType: Joi.string().trim().optional(),
  isVeg: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema,
};
