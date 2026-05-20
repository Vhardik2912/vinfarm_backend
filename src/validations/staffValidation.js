const Joi = require("joi");
const { VALIDATION_MESSAGES, PATTERNS } = require("../constants/constants");

const createStaffSchema = Joi.object({
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
  roleId: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.USER.ROLE_REQUIRED,
    }),
  designationId: Joi.string().required().messages({
    "any.required": "Designation ID is required",
  }),
  password: Joi.string().min(6).required(),
  joindate: Joi.date().required().messages({
    "any.required": VALIDATION_MESSAGES.STAFF.JOIN_DATE_REQUIRED,
  }),
  salary: Joi.number().required().messages({
    "any.required": VALIDATION_MESSAGES.STAFF.SALARY_REQUIRED,
  }),
  isActive: Joi.boolean().optional(),
});

const updateStaffSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  number: Joi.string()
    .pattern(PATTERNS.PHONE)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be a valid format with optional country code",
    }),
  country: Joi.string().optional(),
  roleId: Joi.string().optional(),
  designationId: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  joindate: Joi.date().optional(),
  salary: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
};
