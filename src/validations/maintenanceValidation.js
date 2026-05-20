const Joi = require("joi");
const {
  MAINTENANCE_ISSUE_TYPES,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_STATUS,
  VALIDATION_MESSAGES,
} = require("../constants/constants");

const createMaintenanceSchema = Joi.object({
  reportedBy: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.MAINTENANCE.REPORTER_REQUIRED }),
  roomId: Joi.string().optional().allow(null, ""),
  vehicleId: Joi.string().optional().allow(null, ""),
  propertyId: Joi.string().optional().allow(null, ""),
  issueType: Joi.string().valid(...MAINTENANCE_ISSUE_TYPES).required().messages({ "any.required": VALIDATION_MESSAGES.MAINTENANCE.ISSUE_TYPE_REQUIRED }),
  description: Joi.string().required().messages({ "any.required": VALIDATION_MESSAGES.MAINTENANCE.DESCRIPTION_REQUIRED }),
  priority: Joi.string().valid(...MAINTENANCE_PRIORITY).optional(),
  status: Joi.string().valid(...Object.values(MAINTENANCE_STATUS)).optional(),
  assignedTechnicianId: Joi.string().optional().allow(null, ""),
  cost: Joi.number().min(0).optional(),
  isScheduled: Joi.boolean().optional(),
  scheduledDate: Joi.date().optional().allow(null, ""),
  resolutionNotes: Joi.string().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

const updateMaintenanceSchema = Joi.object({
  id: Joi.string().optional(),
  reportedBy: Joi.string().optional(),
  roomId: Joi.string().optional().allow(null, ""),
  vehicleId: Joi.string().optional().allow(null, ""),
  propertyId: Joi.string().optional().allow(null, ""),
  issueType: Joi.string().valid(...MAINTENANCE_ISSUE_TYPES).optional(),
  description: Joi.string().optional(),
  priority: Joi.string().valid(...MAINTENANCE_PRIORITY).optional(),
  status: Joi.string().valid(...Object.values(MAINTENANCE_STATUS)).optional(),
  assignedTechnicianId: Joi.string().optional().allow(null, ""),
  cost: Joi.number().min(0).optional(),
  isScheduled: Joi.boolean().optional(),
  scheduledDate: Joi.date().optional().allow(null, ""),
  resolutionNotes: Joi.string().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
