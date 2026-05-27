const Joi = require("joi");
const { VEHICLE_BOOKING_STATUS } = require("../constants/booking");

/* ─── Create Vehicle Booking ─────────────────────────── */
const createVehicleBookingSchema = Joi.object({
  vehicleId:   Joi.string().required(),
  propertyId:  Joi.string().required(),
  customerId:  Joi.string().required(),
  createdBy:   Joi.string().optional(),
  assignedTo:  Joi.string().optional().allow(null, ""),

  pickupPoint: Joi.string().trim().required(),
  dropPoint:   Joi.string().trim().required(),
  pickupTime:  Joi.date().iso().required(),
  dropTime:    Joi.date().iso().greater(Joi.ref("pickupTime")).optional().allow(null),

  price:  Joi.number().min(0).required(),
  status: Joi.string().valid(...Object.values(VEHICLE_BOOKING_STATUS)).optional(),
});

/* ─── Update Vehicle Booking ─────────────────────────── */
const updateVehicleBookingSchema = Joi.object({
  vehicleId:   Joi.string().optional(),
  propertyId:  Joi.string().optional(),
  customerId:  Joi.string().optional(),
  assignedTo:  Joi.string().optional().allow(null, ""),

  pickupPoint: Joi.string().trim().optional(),
  dropPoint:   Joi.string().trim().optional(),
  pickupTime:  Joi.date().iso().optional(),
  dropTime:    Joi.date().iso().optional().allow(null),

  price:  Joi.number().min(0).optional(),
  status: Joi.string().valid(...Object.values(VEHICLE_BOOKING_STATUS)).optional(),
});

module.exports = {
  createVehicleBookingSchema,
  updateVehicleBookingSchema,
};
