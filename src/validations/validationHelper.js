const { PATTERNS } = require("../constants/constants");

/**
 * Mongoose validator function for phone number validation
 * Throws an Error directly with the custom message if validation fails.
 * @param {string} v - The phone number to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
const validatePhoneMongoose = (v) => {
  if (!v) return true; // Let required validator handle empty/null cases
  if (!PATTERNS.PHONE.test(v)) {
    throw new Error("Please provide a valid phone number with optional country code");
  }
  return true;
};

/**
 * Joi custom validator function for phone number validation
 * Throws an Error directly with the custom message if validation fails.
 * @param {string} value - The input phone number value
 * @param {Object} helpers - Joi validation helpers
 * @returns {string} The validated value
 * @throws {Error} If invalid
 */
const validatePhoneJoi = (value, helpers) => {
  if (!value) return value;
  if (!PATTERNS.PHONE.test(value)) {
    throw new Error("Please provide a valid phone number with optional country code");
  }
  return value;
};

module.exports = {
  validatePhoneMongoose,
  validatePhoneJoi,
};
