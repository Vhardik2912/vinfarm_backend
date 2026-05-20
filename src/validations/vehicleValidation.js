const Joi = require("joi");
const { VEHICLE_TYPES, VEHICLE_STATUS, VALIDATION_MESSAGES } = require("../constants/constants");

const createVehicleSchema = Joi.object({
  make: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.VEHICLE.MAKE_REQUIRED }),
  model: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.VEHICLE.MODEL_REQUIRED }),
  licensePlate: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.VEHICLE.PLATE_REQUIRED }),
  type: Joi.string().valid(...VEHICLE_TYPES).required().messages({ "any.required": VALIDATION_MESSAGES.VEHICLE.TYPE_REQUIRED }),
  capacity: Joi.number().integer().min(1).required(),
  pricePerDay: Joi.number().min(0).required(),
  priceAirportTrip: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid(...Object.values(VEHICLE_STATUS)).optional(),
  isActive: Joi.boolean().optional(),
});

const updateVehicleSchema = Joi.object({
  id: Joi.string().optional(),
  make: Joi.string().optional(),
  model: Joi.string().optional(),
  licensePlate: Joi.string().optional(),
  type: Joi.string().valid(...VEHICLE_TYPES).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  pricePerDay: Joi.number().min(0).optional(),
  priceAirportTrip: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid(...Object.values(VEHICLE_STATUS)).optional(),
  isActive: Joi.boolean().optional(),
});

const createFuelLogSchema = Joi.object({
  vehicleId: Joi.string().required(),
  fuelQuantity: Joi.number().positive().required(),
  cost: Joi.number().min(0).required(),
  odometerReading: Joi.number().min(0).required(),
});

const createMaintenanceLogSchema = Joi.object({
  vehicleId: Joi.string().required(),
  maintenanceDate: Joi.date().optional(),
  description: Joi.string().required(),
  cost: Joi.number().min(0).required(),
  odometerReading: Joi.number().min(0).required(),
  nextServiceOdometer: Joi.number().min(0).optional().allow(null),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  createFuelLogSchema,
  createMaintenanceLogSchema,
};
