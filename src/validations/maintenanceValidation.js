const Joi = require("joi");
const { MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require("../constants/constants");

const createMaintenanceSchema = Joi.object({
  staffId: Joi.string().optional().allow(null, ""),
  roomId: Joi.string().required(),
  reportedBy: Joi.string().optional(),
  issueType: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  priority: Joi.string().valid(...Object.values(MAINTENANCE_PRIORITY)).optional(),
  assignedTo: Joi.string().optional().allow(null, ""),
  status: Joi.string().valid(...Object.values(MAINTENANCE_STATUS)).optional(),
  reportedAt: Joi.date().optional(),
  remarks: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

const updateMaintenanceSchema = Joi.object({
  staffId: Joi.string().optional().allow(null, ""),
  roomId: Joi.string().optional(),
  reportedBy: Joi.string().optional(),
  issueType: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  priority: Joi.string().valid(...Object.values(MAINTENANCE_PRIORITY)).optional(),
  assignedTo: Joi.string().optional().allow(null, ""),
  status: Joi.string().valid(...Object.values(MAINTENANCE_STATUS)).optional(),
  reportedAt: Joi.date().optional(),
  remarks: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
