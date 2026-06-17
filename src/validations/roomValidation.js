const Joi = require("joi");
const { ROOM_TYPES, BOOKING_STATUS, CLEANING_STATUS, VALIDATION_MESSAGES } = require("../constants/constants");

const createRoomSchema = Joi.object({
  roomNumber: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.ROOM.NUMBER_REQUIRED,
    }),
  roomType: Joi.string()
    .valid(...ROOM_TYPES)
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.ROOM.TYPE_REQUIRED,
      "any.only": `Room type must be one of: ${ROOM_TYPES.join(", ")}`,
    }),
  basePrice: Joi.number()
    .positive()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.ROOM.PRICE_REQUIRED,
      "number.base": "Base price must be a number",
      "number.positive": "Base price must be a positive number",
    }),
  isActive: Joi.boolean().optional(),
  propertyId: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.ROOM.PROPERTY_REQUIRED,
    }),
});

const updateRoomSchema = Joi.object({
  id: Joi.string().optional(),
  roomNumber: Joi.string().optional(),
  roomType: Joi.string()
    .valid(...ROOM_TYPES)
    .optional(),
  basePrice: Joi.number().positive().optional(),
  bookingStatus: Joi.string().valid(...Object.values(BOOKING_STATUS)).optional(),
  cleaningStatus: Joi.string().valid(...Object.values(CLEANING_STATUS)).optional(),
  isActive: Joi.boolean().optional(),
  propertyId: Joi.string().optional(),
});

module.exports = {
  createRoomSchema,
  updateRoomSchema,
};
