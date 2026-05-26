const Joi = require("joi");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const createVehicleSchema = Joi.object({
  propertyId: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.VEHICLE.PROPERTY_REQUIRED,
      "string.empty": VALIDATION_MESSAGES.VEHICLE.PROPERTY_REQUIRED,
    }),
  vehicleName: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.VEHICLE.NAME_REQUIRED,
      "string.empty": VALIDATION_MESSAGES.VEHICLE.NAME_REQUIRED,
    }),
  vehicleType: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.VEHICLE.TYPE_REQUIRED,
      "string.empty": VALIDATION_MESSAGES.VEHICLE.TYPE_REQUIRED,
    }),
  vehicleNumber: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.VEHICLE.NUMBER_REQUIRED,
      "string.empty": VALIDATION_MESSAGES.VEHICLE.NUMBER_REQUIRED,
    }),
  vehicleCapacity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.VEHICLE.CAPACITY_REQUIRED,
      "number.base": "Vehicle capacity must be a number",
      "number.positive": "Vehicle capacity must be a positive number",
    }),
  isActive: Joi.boolean().optional(),
  document: Joi.array().items(Joi.string()).optional(),
});

const updateVehicleSchema = Joi.object({
  id: Joi.string().optional(),
  propertyId: Joi.string().optional(),
  vehicleName: Joi.string().optional(),
  vehicleType: Joi.string().optional(),
  vehicleNumber: Joi.string().optional(),
  vehicleCapacity: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional(),
  document: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
};
