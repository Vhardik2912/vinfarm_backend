const jwt = require("jsonwebtoken");

/**
 * Generate an Access JWT token for a user
 * @param {String} userId - User identifier
 * @returns {String} Signed JWT token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};

/**
 * Generate a Refresh JWT token for a user
 * @param {String} userId - User identifier
 * @returns {String} Signed JWT token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

/**
 * Verify an Access JWT token
 * @param {String} token - Raw JWT token string
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a Refresh JWT token
 * @param {String} token - Raw JWT token string
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
