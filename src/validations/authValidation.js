const Joi = require("joi");
const { VALIDATION_MESSAGES } = require("../constants/constants");
const { validatePhoneJoi } = require("./validationHelper");

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
  phone: Joi.string()
    .custom(validatePhoneJoi)
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.USER.PHONE_REQUIRED,
    }),
  countryCode: Joi.string().optional().default("India"),
  address: Joi.string().optional().allow(""),
});

module.exports = {
  loginSchema,
  registerCustomerSchema,
};
