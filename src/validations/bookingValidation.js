const Joi = require("joi");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS } = require("../constants/booking");

const createBookingSchema = Joi.object({
  customerId: Joi.string().required(),
  createdBy: Joi.string().required(),
  bookingSource: Joi.string().valid("SELF", "STAFF").required(),
  
  accommodation: Joi.object({
    type: Joi.string().valid("ROOM", "PROPERTY").required(),
    refId: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    capacity: Joi.number().min(1).required(),
  }).required(),

  guests: Joi.object({
    adults: Joi.number().min(1).required(),
    children: Joi.number().min(0).optional().default(0),
    totalGuests: Joi.number().min(1).required(),
  }).required(),

  dates: Joi.object({
    checkInDate: Joi.date().iso().required(),
    checkOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required(),
    actualCheckIn: Joi.date().iso().optional().allow(null),
    actualCheckOut: Joi.date().iso().optional().allow(null),
  }).required(),

  pricing: Joi.object({
    baseAmount: Joi.number().min(0).required(),
    serviceAmount: Joi.number().min(0).optional().default(0),
    taxAmount: Joi.number().min(0).optional().default(0),
    discountAmount: Joi.number().min(0).optional().default(0),
    finalAmount: Joi.number().min(0).required(),
  }).required(),

  discountCode: Joi.string().optional().allow(null, ""),
  bookingStatus: Joi.string().valid(...Object.values(ROOM_BOOKING_STATUS)).optional(),
  
  payment: Joi.object({
    status: Joi.string().valid(...Object.values(PAYMENT_STATUS)).optional(),
    method: Joi.string().optional().allow(null, ""),
    transactionId: Joi.string().optional().allow(null, ""),
    paidAt: Joi.date().optional().allow(null),
  }).optional(),

  cancellation: Joi.object({
    reason: Joi.string().optional().allow(null, ""),
    cancelledAt: Joi.date().optional().allow(null),
  }).optional(),

  refund: Joi.object({
    amount: Joi.number().min(0).optional(),
    status: Joi.string().valid(...Object.values(REFUND_STATUS)).optional(),
    processedAt: Joi.date().optional().allow(null),
  }).optional(),
  
  instantBooking: Joi.boolean().optional(),
});

const updateBookingSchema = Joi.object({
  id: Joi.string().optional(),
  customerId: Joi.string().optional(),
  createdBy: Joi.string().optional(),
  bookingSource: Joi.string().valid("SELF", "STAFF").optional(),

  accommodation: Joi.object({
    type: Joi.string().valid("ROOM", "PROPERTY").optional(),
    refId: Joi.string().optional(),
    name: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    capacity: Joi.number().min(1).optional(),
  }).optional(),

  guests: Joi.object({
    adults: Joi.number().min(1).optional(),
    children: Joi.number().min(0).optional(),
    totalGuests: Joi.number().min(1).optional(),
  }).optional(),

  dates: Joi.object({
    checkInDate: Joi.date().iso().optional(),
    checkOutDate: Joi.date().iso().optional(),
    actualCheckIn: Joi.date().iso().optional().allow(null),
    actualCheckOut: Joi.date().iso().optional().allow(null),
  }).optional(),

  pricing: Joi.object({
    baseAmount: Joi.number().min(0).optional(),
    serviceAmount: Joi.number().min(0).optional(),
    taxAmount: Joi.number().min(0).optional(),
    discountAmount: Joi.number().min(0).optional(),
    finalAmount: Joi.number().min(0).optional(),
  }).optional(),

  discountCode: Joi.string().optional().allow(null, ""),
  bookingStatus: Joi.string().valid(...Object.values(ROOM_BOOKING_STATUS)).optional(),
  
  payment: Joi.object({
    status: Joi.string().valid(...Object.values(PAYMENT_STATUS)).optional(),
    method: Joi.string().optional().allow(null, ""),
    transactionId: Joi.string().optional().allow(null, ""),
    paidAt: Joi.date().optional().allow(null),
  }).optional(),

  cancellation: Joi.object({
    reason: Joi.string().optional().allow(null, ""),
    cancelledAt: Joi.date().optional().allow(null),
  }).optional(),

  refund: Joi.object({
    amount: Joi.number().min(0).optional(),
    status: Joi.string().valid(...Object.values(REFUND_STATUS)).optional(),
    processedAt: Joi.date().optional().allow(null),
  }).optional(),
});

module.exports = {
  createBookingSchema,
  updateBookingSchema,
};
