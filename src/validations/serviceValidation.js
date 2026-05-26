const Joi = require("joi");
const { VALIDATION_MESSAGES } = require("../constants/constants");

const createServiceSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.SERVICE.NAME_REQUIRED,
      "string.empty": VALIDATION_MESSAGES.SERVICE.NAME_REQUIRED,
    }),
  isActive: Joi.boolean().optional(),
});

const updateServiceSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
};
