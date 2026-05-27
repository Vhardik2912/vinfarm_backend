const Joi = require("joi");

const createVehicleMaintenanceSchema = Joi.object({
  vehicleId: Joi.string().required(),
  createdBy: Joi.string().optional(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  isResolved: Joi.boolean().optional().default(false),
  resolvedRemarks: Joi.string().trim().optional().allow(null, ""),
  resolvedBy: Joi.string().optional().allow(null, ""),
  amount: Joi.number().min(0).required(),
  bill: Joi.string().optional().allow(null, ""),
});

const updateVehicleMaintenanceSchema = Joi.object({
  vehicleId: Joi.string().optional(),
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  isResolved: Joi.boolean().optional(),
  resolvedRemarks: Joi.string().trim().optional().allow(null, ""),
  resolvedBy: Joi.string().optional().allow(null, ""),
  amount: Joi.number().min(0).optional(),
  bill: Joi.string().optional().allow(null, ""),
});

module.exports = {
  createVehicleMaintenanceSchema,
  updateVehicleMaintenanceSchema,
};
