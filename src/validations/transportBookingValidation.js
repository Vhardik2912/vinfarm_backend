const Joi = require("joi");
const { TRANSPORT_BOOKING_TYPE, TRANSPORT_BOOKING_STATUS, VALIDATION_MESSAGES } = require("../constants/constants");

const createTransportBookingSchema = Joi.object({
  customerId: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.TRANSPORT_BOOKING.CUSTOMER_REQUIRED }),
  vehicleId: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.TRANSPORT_BOOKING.VEHICLE_REQUIRED }),
  driverId: Joi.string().optional().allow(null, ""),
  bookingType: Joi.string().valid(...TRANSPORT_BOOKING_TYPE).required().messages({ "any.required": VALIDATION_MESSAGES.TRANSPORT_BOOKING.TYPE_REQUIRED }),
  pickupLocation: Joi.string().required(),
  dropoffLocation: Joi.string().required(),
  pickupDateTime: Joi.date().required().messages({ "any.required": VALIDATION_MESSAGES.TRANSPORT_BOOKING.PICKUP_TIME_REQUIRED }),
  returnDateTime: Joi.date().optional().allow(null, ""),
  status: Joi.string().valid(...Object.values(TRANSPORT_BOOKING_STATUS)).optional(),
  totalPrice: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

const updateTransportBookingSchema = Joi.object({
  id: Joi.string().optional(),
  customerId: Joi.string().optional(),
  vehicleId: Joi.string().optional(),
  driverId: Joi.string().optional().allow(null, ""),
  bookingType: Joi.string().valid(...TRANSPORT_BOOKING_TYPE).optional(),
  pickupLocation: Joi.string().optional(),
  dropoffLocation: Joi.string().optional(),
  pickupDateTime: Joi.date().optional(),
  returnDateTime: Joi.date().optional().allow(null, ""),
  status: Joi.string().valid(...Object.values(TRANSPORT_BOOKING_STATUS)).optional(),
  totalPrice: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createTransportBookingSchema,
  updateTransportBookingSchema,
};
