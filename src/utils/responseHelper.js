const { HTTP_STATUS, JSON_STATUS } = require("../constants/constants");

/**
 * Wraps an async express route handler to catch any unhandled errors and pass them to next()
 * @param {string|Function} nameOrFn - Handler name or actual function
 * @param {Function} [fn] - Async controller function
 * @returns {Function}
 */
const catchAsync = (nameOrFn, fn) => {
  const isNamed = typeof nameOrFn === "string";
  const handler = isNamed ? fn : nameOrFn;
  
  return (req, res, next) => {
    handler(req, res, next).catch((err) => {
      if (isNamed) {
        err.origin = nameOrFn;
      }
      next(err);
    });
  };
};

/**
 * Standardized success response helper
 * @param {Object} params
 * @param {number} params.statusCode - HTTP Status Code (default 200)
 * @param {string} params.message - Custom success message
 * @param {any} params.data - Primary payload data
 * @param {Object} params.other - Additional properties/metadata
 * @param {Object} params.res - Express response object
 */
const successResponse = ({
  statusCode = HTTP_STATUS.OK,
  message,
  data,
  other,
  res,
}) => {
  const responseBody = {
    success: JSON_STATUS.SUCCESS,
  };

  if (message) responseBody.message = message;
  
  if (data !== undefined) {
    if (Array.isArray(data)) {
      responseBody.count = data.length;
    }
    responseBody.data = data;
  }

  if (other) {
    Object.assign(responseBody, other);
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  catchAsync,
  successResponse,
};
