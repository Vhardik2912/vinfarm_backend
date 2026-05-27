const Maintenance = require("../models/Maintenance");
const Room = require("../models/Room");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { getPagination } = require("../utils/paginationHelper");
const { MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require("../constants/constants");

// @desc    Get all maintenance records
// @route   GET /api/maintenance/get
// @access  Private
exports.getMaintenances = catchAsync("getMaintenances", async (req, res, next) => {
  const { roomId, staffId, reportedBy, assignedTo, status, priority } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (roomId) filter.roomId = roomId;
  if (staffId) filter.staffId = staffId;
  if (reportedBy) filter.reportedBy = reportedBy;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const total = await Maintenance.countDocuments(filter);
  const records = await Maintenance.find(filter)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate("staffId", "name email phone role")
    .populate("reportedBy", "name email phone role")
    .populate("assignedTo", "name email phone role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: records, other: buildMeta(total) });
});

// @desc    Get single maintenance record by ID
// @route   GET /api/maintenance/getid/:id
// @access  Private
exports.getMaintenance = catchAsync("getMaintenance", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) throw new AppError("Please provide a maintenance record ID", 400);

  const record = await Maintenance.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate("staffId", "name email phone role")
    .populate("reportedBy", "name email phone role")
    .populate("assignedTo", "name email phone role");

  if (!record) throw new AppError("Maintenance record not found", 404);

  successResponse({ res, data: record });
});

// @desc    Create new maintenance record
// @route   POST /api/maintenance/post
// @access  Private
exports.createMaintenance = catchAsync("createMaintenance", async (req, res, next) => {
  const { staffId, roomId, reportedBy, issueType, description, priority, assignedTo, status, reportedAt, remarks, isActive } = req.body;

  if (!roomId || !issueType || !description) {
    throw new AppError("Please provide all required maintenance details", 400);
  }

  // 1. Verify room exists
  const roomExists = await Room.findOne({ _id: roomId, isDeleted: false });
  if (!roomExists) {
    throw new AppError("Selected room not found", 404);
  }

  // 2. Verify reportedBy exists (default to req.user._id if not supplied)
  const finalReportedBy = reportedBy || req.user._id;
  const reporterExists = await User.findById(finalReportedBy);
  if (!reporterExists) {
    throw new AppError("Reporter user not found", 404);
  }

  // 3. Verify staffId exists if provided
  if (staffId) {
    const staffExists = await User.findById(staffId);
    if (!staffExists) throw new AppError("Staff user not found", 404);
  }

  // 4. Verify assignedTo exists if provided
  if (assignedTo) {
    const assignedUserExists = await User.findById(assignedTo);
    if (!assignedUserExists) throw new AppError("Assigned staff user not found", 404);
  }

  const record = await Maintenance.create({
    staffId: staffId || null,
    roomId,
    reportedBy: finalReportedBy,
    issueType,
    description,
    priority: priority || MAINTENANCE_PRIORITY.MEDIUM,
    assignedTo: assignedTo || null,
    status: status || MAINTENANCE_STATUS.PENDING,
    reportedAt: reportedAt || Date.now(),
    remarks: remarks || "",
    isActive: isActive !== undefined ? isActive : true,
  });

  const populatedRecord = await Maintenance.findById(record._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate("staffId", "name email phone role")
    .populate("reportedBy", "name email phone role")
    .populate("assignedTo", "name email phone role");

  successResponse({
    res,
    statusCode: 201,
    message: "Maintenance record added successfully",
    data: populatedRecord,
  });
});

// @desc    Update maintenance record details
// @route   PUT /api/maintenance/put/:id
// @access  Private
exports.updateMaintenance = catchAsync("updateMaintenance", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) throw new AppError("Please provide a maintenance record ID", 400);

  const record = await Maintenance.findOne({ _id: id, isDeleted: false });
  if (!record) throw new AppError("Maintenance record not found", 404);

  const { staffId, roomId, reportedBy, issueType, description, priority, assignedTo, status, reportedAt, remarks, isActive } = req.body;

  // Verify references if changing
  if (roomId) {
    const roomExists = await Room.findOne({ _id: roomId, isDeleted: false });
    if (!roomExists) throw new AppError("Selected room not found", 404);
    record.roomId = roomId;
  }

  if (reportedBy) {
    const reporterExists = await User.findById(reportedBy);
    if (!reporterExists) throw new AppError("Reporter user not found", 404);
    record.reportedBy = reportedBy;
  }

  if (staffId) {
    const staffExists = await User.findById(staffId);
    if (!staffExists) throw new AppError("Staff user not found", 404);
    record.staffId = staffId;
  } else if (staffId === null) {
    record.staffId = null;
  }

  if (assignedTo) {
    const assignedUserExists = await User.findById(assignedTo);
    if (!assignedUserExists) throw new AppError("Assigned staff user not found", 404);
    record.assignedTo = assignedTo;
  } else if (assignedTo === null) {
    record.assignedTo = null;
  }

  if (issueType) record.issueType = issueType;
  if (description) record.description = description;
  if (priority) record.priority = priority;
  if (status) record.status = status;
  if (reportedAt) record.reportedAt = reportedAt;
  if (remarks !== undefined) record.remarks = remarks;
  if (isActive !== undefined) record.isActive = isActive;

  await record.save();

  const populatedRecord = await Maintenance.findById(record._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate("staffId", "name email phone role")
    .populate("reportedBy", "name email phone role")
    .populate("assignedTo", "name email phone role");

  successResponse({
    res,
    message: "Maintenance record updated successfully",
    data: populatedRecord,
  });
});

// @desc    Assign maintenance to a staff
// @route   PUT /api/maintenance/assign/:id
// @access  Private
exports.assignMaintenance = catchAsync("assignMaintenance", async (req, res, next) => {
  const id = req.params.id;
  const { assignedTo } = req.body;

  if (!assignedTo) {
    throw new AppError("Please specify a staff user to assign this task", 400);
  }

  const record = await Maintenance.findOne({ _id: id, isDeleted: false });
  if (!record) throw new AppError("Maintenance record not found", 404);

  const staffExists = await User.findById(assignedTo);
  if (!staffExists) {
    throw new AppError("Assigned staff user not found", 404);
  }

  record.assignedTo = assignedTo;
  record.status = MAINTENANCE_STATUS.IN_PROGRESS; // Mark in-progress upon assignment
  await record.save();

  const populatedRecord = await Maintenance.findById(record._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate("staffId", "name email phone role")
    .populate("reportedBy", "name email phone role")
    .populate("assignedTo", "name email phone role");

  successResponse({
    res,
    message: "Maintenance task assigned and marked in-progress",
    data: populatedRecord,
  });
});

// @desc    Update maintenance task status
// @route   PUT /api/maintenance/status/:id
// @access  Private
exports.updateMaintenanceStatus = catchAsync("updateMaintenanceStatus", async (req, res, next) => {
  const id = req.params.id;
  const { status, remarks } = req.body;

  if (!status || !Object.values(MAINTENANCE_STATUS).includes(status)) {
    throw new AppError("Please provide a valid maintenance status", 400);
  }

  const record = await Maintenance.findOne({ _id: id, isDeleted: false });
  if (!record) throw new AppError("Maintenance record not found", 404);

  record.status = status;
  if (remarks !== undefined) {
    record.remarks = remarks;
  }
  await record.save();

  const populatedRecord = await Maintenance.findById(record._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate("staffId", "name email phone role")
    .populate("reportedBy", "name email phone role")
    .populate("assignedTo", "name email phone role");

  successResponse({
    res,
    message: `Maintenance status updated to ${status} successfully`,
    data: populatedRecord,
  });
});

// @desc    Soft delete maintenance record
// @route   DELETE /api/maintenance/delete/:id
// @access  Private
exports.deleteMaintenance = catchAsync("deleteMaintenance", async (req, res, next) => {
  const id = req.params.id;

  const record = await Maintenance.findOne({ _id: id, isDeleted: false });
  if (!record) throw new AppError("Maintenance record not found", 404);

  record.isDeleted = true;
  record.isActive = false;
  await record.save();

  successResponse({
    res,
    message: "Maintenance record deleted successfully (soft deleted)",
  });
});
