const Joi = require("joi");
const { ROOM_TYPES, VALIDATION_MESSAGES, PATTERNS, CUSTOMER_STATUS } = require("../constants/constants");

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
    .pattern(PATTERNS.PHONE)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid format with optional country code",
      "any.required": VALIDATION_MESSAGES.USER.PHONE_REQUIRED,
    }),
  address: Joi.string().optional().allow(""),
  roomType: Joi.string()
    .valid(...ROOM_TYPES)
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.CUSTOMER.ROOM_TYPE_REQUIRED,
      "any.only": `Room type must be one of: ${ROOM_TYPES.join(", ")}`,
    }),
  checkIn: Joi.date()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.CUSTOMER.CHECKIN_REQUIRED,
    }),
  checkOut: Joi.date()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.CUSTOMER.CHECKOUT_REQUIRED,
    }),
  price: Joi.number()
    .positive()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.CUSTOMER.PRICE_REQUIRED,
      "number.base": "Price must be a number",
      "number.positive": "Price must be a positive number",
    }),
  status: Joi.string()
    .valid(...Object.values(CUSTOMER_STATUS))
    .optional()
    .messages({
      "any.only": `Status must be one of: ${Object.values(CUSTOMER_STATUS).join(", ")}`,
    }),
});

const updateCustomerSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(PATTERNS.PHONE)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be a valid format with optional country code",
    }),
  address: Joi.string().optional().allow(""),
  loyaltyPoints: Joi.number().optional(),
  roomType: Joi.string()
    .valid(...ROOM_TYPES)
    .optional(),
  checkIn: Joi.date().optional(),
  checkOut: Joi.date().optional(),
  price: Joi.number().positive().optional(),
  status: Joi.string()
    .valid(...Object.values(CUSTOMER_STATUS))
    .optional(),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
