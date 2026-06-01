const Joi = require("joi");

const housekeepingStaffValidationSchema = Joi.object({
  staffId: Joi.string().required(),
  role: Joi.string().required(),
  assignedAt: Joi.date().optional(),
});

const createHousekeepingSchema = Joi.object({
  bookingId: Joi.string().optional().allow(null, ""),
  roomId: Joi.string().required(),
  taskType: Joi.string().trim().required(),
  scheduledDate: Joi.date().required(),
  staff: Joi.array().items(housekeepingStaffValidationSchema).optional().default([]),
  assignedBy: Joi.string().optional(),
  completedBy: Joi.string().optional().allow(null, ""),
  remarks: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

const updateHousekeepingSchema = Joi.object({
  bookingId: Joi.string().optional().allow(null, ""),
  roomId: Joi.string().optional(),
  taskType: Joi.string().trim().optional(),
  scheduledDate: Joi.date().optional(),
  staff: Joi.array().items(housekeepingStaffValidationSchema).optional(),
  assignedBy: Joi.string().optional(),
  completedBy: Joi.string().optional().allow(null, ""),
  remarks: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createHousekeepingSchema,
  updateHousekeepingSchema,
};
