const Joi = require("joi");
const { VALIDATION_MESSAGES, PATTERNS } = require("../constants/constants");

const createDriverSchema = Joi.object({
  name: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.DRIVER.NAME_REQUIRED }),
  phone: Joi.string()
    .pattern(PATTERNS.PHONE)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid format with optional country code",
      "any.required": VALIDATION_MESSAGES.DRIVER.PHONE_REQUIRED,
    }),
  country: Joi.string().optional().default("India"),
  licenseNumber: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.DRIVER.LICENSE_REQUIRED }),
  isActive: Joi.boolean().optional(),
});

const updateDriverSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  phone: Joi.string()
    .pattern(PATTERNS.PHONE)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be a valid format with optional country code",
    }),
  country: Joi.string().optional(),
  licenseNumber: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createDriverSchema,
  updateDriverSchema,
};
