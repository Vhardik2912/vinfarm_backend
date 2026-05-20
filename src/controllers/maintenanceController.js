const Maintenance = require("../models/Maintenance");
const User = require("../models/User");
const Room = require("../models/Room");
const Vehicle = require("../models/Vehicle");
const Property = require("../models/Property");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all maintenance records
// @route   GET /api/maintenance/get
// @access  Public
exports.getMaintenances = catchAsync("getMaintenances", async (req, res, next) => {
  const records = await Maintenance.find({ isDeleted: false })
    .populate("reportedBy", "name email number")
    .populate("roomId", "roomNumber roomType basePrice")
    .populate("vehicleId", "make model licensePlate type")
    .populate("propertyId", "name type location")
    .populate("assignedTechnicianId", "name email number");

  successResponse({
    res,
    data: records,
  });
});

// @desc    Get single maintenance record by ID
// @route   POST /api/maintenance/getid
// @access  Public
exports.getMaintenance = catchAsync("getMaintenance", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a maintenance ID", 400);
  }

  const record = await Maintenance.findOne({ _id: id, isDeleted: false })
    .populate("reportedBy", "name email number")
    .populate("roomId", "roomNumber roomType basePrice")
    .populate("vehicleId", "make model licensePlate type")
    .populate("propertyId", "name type location")
    .populate("assignedTechnicianId", "name email number");

  if (!record) {
    throw new AppError("Maintenance record not found", 404);
  }

  successResponse({
    res,
    data: record,
  });
});

// @desc    Create new maintenance record
// @route   POST /api/maintenance/post
// @access  Public
exports.createMaintenance = catchAsync("createMaintenance", async (req, res, next) => {
  const {
    reportedBy,
    roomId,
    vehicleId,
    propertyId,
    issueType,
    description,
    priority,
    status,
    assignedTechnicianId,
    cost,
    isScheduled,
    scheduledDate,
  } = req.body;

  // Validate reporter exists
  const reporterExists = await User.findOne({ _id: reportedBy, isDeleted: false });
  if (!reporterExists) {
    throw new AppError("Reporting user not found", 404);
  }

  // Validate room if provided
  if (roomId) {
    const roomExists = await Room.findOne({ _id: roomId, isDeleted: false });
    if (!roomExists) {
      throw new AppError("Room not found", 404);
    }
  }

  // Validate vehicle if provided
  if (vehicleId) {
    const vehicleExists = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
    if (!vehicleExists) {
      throw new AppError("Vehicle not found", 404);
    }
  }

  // Validate property if provided
  if (propertyId) {
    const propertyExists = await Property.findOne({ _id: propertyId, isDeleted: false });
    if (!propertyExists) {
      throw new AppError("Property not found", 404);
    }
  }

  // Validate technician if provided
  if (assignedTechnicianId) {
    const techExists = await User.findOne({ _id: assignedTechnicianId, isDeleted: false });
    if (!techExists) {
      throw new AppError("Assigned technician not found", 404);
    }
  }

  const record = await Maintenance.create({
    reportedBy,
    roomId: roomId || null,
    vehicleId: vehicleId || null,
    propertyId: propertyId || null,
    issueType,
    description,
    priority: priority || "Medium",
    status: status || "Pending",
    assignedTechnicianId: assignedTechnicianId || null,
    cost: cost || 0,
    isScheduled: isScheduled || false,
    scheduledDate: isScheduled ? scheduledDate : null,
  });

  successResponse({
    res,
    statusCode: 201,
    data: record,
  });
});

// @desc    Update maintenance record
// @route   POST /api/maintenance/put
// @access  Public
exports.updateMaintenance = catchAsync("updateMaintenance", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a maintenance ID", 400);
  }

  const record = await Maintenance.findOne({ _id: id, isDeleted: false });
  if (!record) {
    throw new AppError("Maintenance record not found", 404);
  }

  const {
    reportedBy,
    roomId,
    vehicleId,
    propertyId,
    issueType,
    description,
    priority,
    status,
    assignedTechnicianId,
    cost,
    isScheduled,
    scheduledDate,
    resolutionNotes,
    isActive,
  } = req.body;

  // Validate updates references if provided
  if (reportedBy) {
    const reporterExists = await User.findOne({ _id: reportedBy, isDeleted: false });
    if (!reporterExists) throw new AppError("Reporting user not found", 404);
    record.reportedBy = reportedBy;
  }

  if (roomId !== undefined) {
    if (roomId) {
      const roomExists = await Room.findOne({ _id: roomId, isDeleted: false });
      if (!roomExists) throw new AppError("Room not found", 404);
      record.roomId = roomId;
    } else {
      record.roomId = null;
    }
  }

  if (vehicleId !== undefined) {
    if (vehicleId) {
      const vehicleExists = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
      if (!vehicleExists) throw new AppError("Vehicle not found", 404);
      record.vehicleId = vehicleId;
    } else {
      record.vehicleId = null;
    }
  }

  if (propertyId !== undefined) {
    if (propertyId) {
      const propertyExists = await Property.findOne({ _id: propertyId, isDeleted: false });
      if (!propertyExists) throw new AppError("Property not found", 404);
      record.propertyId = propertyId;
    } else {
      record.propertyId = null;
    }
  }

  if (assignedTechnicianId !== undefined) {
    if (assignedTechnicianId) {
      const techExists = await User.findOne({ _id: assignedTechnicianId, isDeleted: false });
      if (!techExists) throw new AppError("Technician not found", 404);
      record.assignedTechnicianId = assignedTechnicianId;
    } else {
      record.assignedTechnicianId = null;
    }
  }

  const statusChanged = status && status !== record.status;
  const notesChanged = resolutionNotes && resolutionNotes !== record.resolutionNotes;

  if (statusChanged) {
    record.repairHistory.push({
      status: status,
      notes: resolutionNotes || `Status updated to ${status}`,
      updatedBy: req.user ? req.user._id : record.reportedBy,
      updatedAt: new Date(),
    });
  } else if (notesChanged) {
    record.repairHistory.push({
      status: record.status,
      notes: resolutionNotes,
      updatedBy: req.user ? req.user._id : record.reportedBy,
      updatedAt: new Date(),
    });
  }

  record.issueType = issueType || record.issueType;
  record.description = description || record.description;
  record.priority = priority || record.priority;
  record.status = status || record.status;
  record.cost = cost !== undefined ? cost : record.cost;
  record.isScheduled = isScheduled !== undefined ? isScheduled : record.isScheduled;
  record.scheduledDate = record.isScheduled ? (scheduledDate || record.scheduledDate) : null;
  record.resolutionNotes = resolutionNotes !== undefined ? resolutionNotes : record.resolutionNotes;
  record.isActive = isActive !== undefined ? isActive : record.isActive;

  await record.save();

  successResponse({
    res,
    data: record,
  });
});

// @desc    Delete maintenance record
// @route   POST /api/maintenance/delete
// @access  Public
exports.deleteMaintenance = catchAsync("deleteMaintenance", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a maintenance ID", 400);
  }

  const record = await Maintenance.findOne({ _id: id, isDeleted: false });
  if (!record) {
    throw new AppError("Maintenance record not found", 404);
  }

  // Soft delete
  record.isDeleted = true;
  record.isActive = false;
  await record.save();

  successResponse({
    res,
    message: "Maintenance record deleted successfully (soft deleted)",
  });
});
