const { HTTP_STATUS, JSON_STATUS } = require("../constants/constants");

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.stack || err.message);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong on the server";

  res.status(statusCode).json({
    success: JSON_STATUS.FAIL,
    message,
  });
};

module.exports = errorHandler;
