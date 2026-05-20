const { HTTP_STATUS, JSON_STATUS } = require("../constants/constants");

/**
 * Express middleware to validate request body against a Joi schema
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Include all errors, not just the first one
      allowUnknown: true, // Allow fields not in the schema (e.g. file uploads, token)
      stripUnknown: true, // Remove fields not defined in schema
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: JSON_STATUS.FAIL,
        errors: errorMessages,
      });
    }

    next();
  };
};

module.exports = validate;
