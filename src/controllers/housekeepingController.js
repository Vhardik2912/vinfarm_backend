const Housekeeping = require("../models/Housekeeping");
const Room = require("../models/Room");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { getPagination } = require("../utils/paginationHelper");

// @desc    Get all housekeeping tasks
// @route   GET /api/housekeeping/get
// @access  Private
exports.getHousekeepingTasks = catchAsync("getHousekeepingTasks", async (req, res, next) => {
  const { roomId, bookingId, assignedBy, taskType } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (roomId) filter.roomId = roomId;
  if (bookingId) filter.bookingId = bookingId;
  if (assignedBy) filter.assignedBy = assignedBy;
  if (taskType) filter.taskType = taskType;

  const total = await Housekeeping.countDocuments(filter);
  const tasks = await Housekeeping.find(filter)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate({
      path: "bookingId",
      select: "accommodation guests dates pricing",
    })
    .populate("assignedBy", "name email phone role")
    .populate("completedBy", "name email phone role")
    .populate("staff.staffId", "name email phone role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: tasks, other: buildMeta(total) });
});

// @desc    Get single housekeeping task by ID
// @route   GET /api/housekeeping/getid/:id
// @access  Private
exports.getHousekeepingTask = catchAsync("getHousekeepingTask", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) throw new AppError("Please provide a housekeeping task ID", 400);

  const task = await Housekeeping.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate({
      path: "bookingId",
      select: "accommodation guests dates pricing",
    })
    .populate("assignedBy", "name email phone role")
    .populate("completedBy", "name email phone role")
    .populate("staff.staffId", "name email phone role");

  if (!task) throw new AppError("Housekeeping task not found", 404);

  successResponse({ res, data: task });
});

// @desc    Create new housekeeping task
// @route   POST /api/housekeeping/post
// @access  Private
exports.createHousekeepingTask = catchAsync("createHousekeepingTask", async (req, res, next) => {
  const { bookingId, roomId, taskType, scheduledDate, staff, assignedBy, completedBy, remarks, isActive } = req.body;

  if (!roomId || !taskType || !scheduledDate) {
    throw new AppError("Please provide all required housekeeping details", 400);
  }

  // 1. Verify room exists
  const roomExists = await Room.findOne({ _id: roomId, isDeleted: false });
  if (!roomExists) {
    throw new AppError("Selected room not found", 404);
  }

  // 2. Verify booking exists if provided
  if (bookingId) {
    const bookingExists = await Booking.findOne({ _id: bookingId, isDeleted: false });
    if (!bookingExists) {
      throw new AppError("Selected booking not found", 404);
    }
  }

  // 3. Verify assignedBy user exists (default to req.user._id if not supplied)
  const finalAssignedBy = assignedBy || req.user._id;
  const assignerExists = await User.findById(finalAssignedBy);
  if (!assignerExists) {
    throw new AppError("Assigner user not found", 404);
  }

  // 4. Verify completedBy exists if provided
  if (completedBy) {
    const completedUserExists = await User.findById(completedBy);
    if (!completedUserExists) {
      throw new AppError("Completed by user not found", 404);
    }
  }

  // 5. Verify staffId references in staff array
  if (staff && staff.length > 0) {
    for (const member of staff) {
      const staffExists = await User.findById(member.staffId);
      if (!staffExists) {
        throw new AppError(`Staff member user with ID ${member.staffId} not found`, 404);
      }
    }
  }

  const task = await Housekeeping.create({
    bookingId: bookingId || null,
    roomId,
    taskType,
    scheduledDate,
    staff: staff || [],
    assignedBy: finalAssignedBy,
    completedBy: completedBy || null,
    remarks: remarks || "",
    isActive: isActive !== undefined ? isActive : true,
  });

  const populatedTask = await Housekeeping.findById(task._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate({
      path: "bookingId",
      select: "accommodation guests dates pricing",
    })
    .populate("assignedBy", "name email phone role")
    .populate("completedBy", "name email phone role")
    .populate("staff.staffId", "name email phone role");

  successResponse({
    res,
    statusCode: 201,
    message: "Housekeeping task created successfully",
    data: populatedTask,
  });
});

// @desc    Update housekeeping task details
// @route   PUT /api/housekeeping/put/:id
// @access  Private
exports.updateHousekeepingTask = catchAsync("updateHousekeepingTask", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) throw new AppError("Please provide a housekeeping task ID", 400);

  const task = await Housekeeping.findOne({ _id: id, isDeleted: false });
  if (!task) throw new AppError("Housekeeping task not found", 404);

  const { bookingId, roomId, taskType, scheduledDate, staff, assignedBy, completedBy, remarks, isActive } = req.body;

  // Verify references if changing
  if (roomId) {
    const roomExists = await Room.findOne({ _id: roomId, isDeleted: false });
    if (!roomExists) throw new AppError("Selected room not found", 404);
    task.roomId = roomId;
  }

  if (bookingId) {
    const bookingExists = await Booking.findOne({ _id: bookingId, isDeleted: false });
    if (!bookingExists) throw new AppError("Selected booking not found", 404);
    task.bookingId = bookingId;
  } else if (bookingId === null) {
    task.bookingId = null;
  }

  if (assignedBy) {
    const assignerExists = await User.findById(assignedBy);
    if (!assignerExists) throw new AppError("Assigner user not found", 404);
    task.assignedBy = assignedBy;
  }

  if (completedBy) {
    const completedUserExists = await User.findById(completedBy);
    if (!completedUserExists) throw new AppError("Completed by user not found", 404);
    task.completedBy = completedBy;
  } else if (completedBy === null) {
    task.completedBy = null;
  }

  if (staff && staff.length > 0) {
    for (const member of staff) {
      const staffExists = await User.findById(member.staffId);
      if (!staffExists) {
        throw new AppError(`Staff member user with ID ${member.staffId} not found`, 404);
      }
    }
    task.staff = staff;
  }

  if (taskType) task.taskType = taskType;
  if (scheduledDate) task.scheduledDate = scheduledDate;
  if (remarks !== undefined) task.remarks = remarks;
  if (isActive !== undefined) task.isActive = isActive;

  await task.save();

  const populatedTask = await Housekeeping.findById(task._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate({
      path: "bookingId",
      select: "accommodation guests dates pricing",
    })
    .populate("assignedBy", "name email phone role")
    .populate("completedBy", "name email phone role")
    .populate("staff.staffId", "name email phone role");

  successResponse({
    res,
    message: "Housekeeping task updated successfully",
    data: populatedTask,
  });
});

// @desc    Assign staff members to a housekeeping task
// @route   PUT /api/housekeeping/assign/:id
// @access  Private
exports.assignHousekeepingStaff = catchAsync("assignHousekeepingStaff", async (req, res, next) => {
  const id = req.params.id;
  const { staff } = req.body;

  if (!staff || !Array.isArray(staff) || staff.length === 0) {
    throw new AppError("Please specify staff members to assign to this task", 400);
  }

  const task = await Housekeeping.findOne({ _id: id, isDeleted: false });
  if (!task) throw new AppError("Housekeeping task not found", 404);

  for (const member of staff) {
    if (!member.staffId || !member.role) {
      throw new AppError("Each assigned staff member must have a staffId and a role", 400);
    }
    const staffExists = await User.findById(member.staffId);
    if (!staffExists) {
      throw new AppError(`Staff member user with ID ${member.staffId} not found`, 404);
    }
  }

  task.staff = staff;
  await task.save();

  const populatedTask = await Housekeeping.findById(task._id)
    .populate({
      path: "roomId",
      select: "roomNumber roomType basePrice propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .populate({
      path: "bookingId",
      select: "accommodation guests dates pricing",
    })
    .populate("assignedBy", "name email phone role")
    .populate("completedBy", "name email phone role")
    .populate("staff.staffId", "name email phone role");

  successResponse({
    res,
    message: "Housekeeping task assigned to staff successfully",
    data: populatedTask,
  });
});

// @desc    Soft delete housekeeping task
// @route   DELETE /api/housekeeping/delete/:id
// @access  Private
exports.deleteHousekeepingTask = catchAsync("deleteHousekeepingTask", async (req, res, next) => {
  const id = req.params.id;

  const task = await Housekeeping.findOne({ _id: id, isDeleted: false });
  if (!task) throw new AppError("Housekeeping task not found", 404);

  task.isDeleted = true;
  task.isActive = false;
  await task.save();

  successResponse({
    res,
    message: "Housekeeping task deleted successfully (soft deleted)",
  });
});
