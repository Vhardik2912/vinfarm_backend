const Joi = require("joi");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS } = require("../constants/booking");

const createBookingSchema = Joi.object({
  customerId: Joi.string().required(),
  createdBy: Joi.string().required(),
  bookingSource: Joi.string().valid("SELF", "STAFF").required(),
  roomId: Joi.string().required(),
  roomSnapshot: Joi.object({
    roomName: Joi.string().optional(),
    pricePerNight: Joi.number().min(0).optional(),
    capacity: Joi.number().min(1).optional(),
  }).optional(),
  guests: Joi.object({
    adults: Joi.number().min(1).required(),
    children: Joi.number().min(0).optional().default(0),
  }).required(),
  totalGuests: Joi.number().min(1).required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required(),
  actualCheckIn: Joi.date().iso().optional().allow(null),
  actualCheckOut: Joi.date().iso().optional().allow(null),
  services: Joi.array().items(
    Joi.object({
      serviceId: Joi.string().optional(),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().min(1).optional().default(1),
      total: Joi.number().min(0).optional(),
    })
  ).optional().default([]),
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
    reason: Joi.string().optional(),
    cancelledAt: Joi.date().optional(),
  }).optional(),
  refund: Joi.object({
    amount: Joi.number().min(0).optional(),
    status: Joi.string().valid(...Object.values(REFUND_STATUS)).optional(),
    processedAt: Joi.date().optional(),
  }).optional(),
});

const updateBookingSchema = Joi.object({
  id: Joi.string().optional(),
  customerId: Joi.string().optional(),
  createdBy: Joi.string().optional(),
  bookingSource: Joi.string().valid("SELF", "STAFF").optional(),
  roomId: Joi.string().optional(),
  roomSnapshot: Joi.object({
    roomName: Joi.string().optional(),
    pricePerNight: Joi.number().min(0).optional(),
    capacity: Joi.number().min(1).optional(),
  }).optional(),
  guests: Joi.object({
    adults: Joi.number().min(1).optional(),
    children: Joi.number().min(0).optional(),
  }).optional(),
  totalGuests: Joi.number().min(1).optional(),
  checkInDate: Joi.date().iso().optional(),
  checkOutDate: Joi.date().iso().optional(),
  actualCheckIn: Joi.date().iso().optional().allow(null),
  actualCheckOut: Joi.date().iso().optional().allow(null),
  services: Joi.array().items(
    Joi.object({
      serviceId: Joi.string().optional(),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().min(1).optional(),
      total: Joi.number().min(0).optional(),
    })
  ).optional(),
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
    reason: Joi.string().optional(),
    cancelledAt: Joi.date().optional(),
  }).optional(),
  refund: Joi.object({
    amount: Joi.number().min(0).optional(),
    status: Joi.string().valid(...Object.values(REFUND_STATUS)).optional(),
    processedAt: Joi.date().optional(),
  }).optional(),
});

module.exports = {
  createBookingSchema,
  updateBookingSchema,
};
