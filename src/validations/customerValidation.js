const Joi = require("joi");
const { VALIDATION_MESSAGES } = require("../constants/constants");
const { validatePhoneJoi } = require("./validationHelper");

const createCustomerSchema = Joi.object({
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
  address: Joi.string().optional().allow(""),
  isActive: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
  // status removed from CustomerProfile schema
});

const updateCustomerSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .custom(validatePhoneJoi)
    .optional(),
  address: Joi.string().optional().allow(""),
  loyaltyPoints: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
  // status removed from CustomerProfile schema
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
