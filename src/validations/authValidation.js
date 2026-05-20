const Joi = require("joi");
const { VALIDATION_MESSAGES, PATTERNS } = require("../constants/constants");

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": VALIDATION_MESSAGES.USER.EMAIL_VALID,
      "any.required": VALIDATION_MESSAGES.USER.EMAIL_REQUIRED,
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
});

const registerCustomerSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.USER.NAME_REQUIRED,
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": VALIDATION_MESSAGES.USER.EMAIL_VALID,
      "any.required": VALIDATION_MESSAGES.USER.EMAIL_REQUIRED,
    }),
  number: Joi.string()
    .pattern(PATTERNS.PHONE)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid format with optional country code",
      "any.required": VALIDATION_MESSAGES.USER.NUMBER_REQUIRED,
    }),
  country: Joi.string().optional().default("India"),
  address: Joi.string().optional().allow(""),
});

module.exports = {
  loginSchema,
  registerCustomerSchema,
};
