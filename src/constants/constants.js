const HTTP_STATUS = require("./httpStatus");
const { MESSAGES, VALIDATION_MESSAGES } = require("./messages");
const { BOOKING_STATUS, CLEANING_STATUS, ROOM_TYPES } = require("./room");
const PROPERTY_TYPES = require("./property");
const { JSON_STATUS } = require("./jsonStatus");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS, EXTRA_SERVICES, CUSTOMER_STATUS } = require("./booking");
const PATTERNS = require("./patterns");

module.exports = {
  HTTP_STATUS,
  BOOKING_STATUS,
  CLEANING_STATUS,
  ROOM_TYPES,
  PROPERTY_TYPES,
  MESSAGES,
  VALIDATION_MESSAGES,
  JSON_STATUS,
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_STATUS,
  EXTRA_SERVICES,
  CUSTOMER_STATUS,
  PATTERNS,
};
