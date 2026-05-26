const Joi = require("joi");
const { VALIDATION_MESSAGES } = require("../constants/constants");
const { validatePhoneJoi } = require("./validationHelper");

const createUserSchema = Joi.object({
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
  roleId: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.USER.ROLE_REQUIRED,
    }),
  password: Joi.string().min(6).optional(),
  joinDate: Joi.date().optional(),
  salary: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
  address: Joi.string().optional().allow(""),
});

const updateUserSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .custom(validatePhoneJoi)
    .optional(),
  countryCode: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  joinDate: Joi.date().optional(),
  salary: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
  address: Joi.string().optional().allow(""),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
