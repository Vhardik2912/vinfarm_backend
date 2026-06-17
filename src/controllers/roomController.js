const Room = require("../models/Room");
const Property = require("../models/Property");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all rooms
// @route   GET /api/v1/rooms/get
// @access  Public
exports.getRooms = catchAsync("getRooms", async (req, res, next) => {
  const rooms = await Room.find({ isDeleted: false }).populate("propertyId", "name type location");
  successResponse({
    res,
    data: rooms,
  });
});

// @desc    Get single room by ID
// @route   POST /api/v1/rooms/getid
// @access  Public
exports.getRoom = catchAsync("getRoom", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a room ID", 400);
  }

  const room = await Room.findOne({ _id: id, isDeleted: false }).populate("propertyId", "name type location");
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  successResponse({
    res,
    data: room,
  });
});

// @desc    Create new room
// @route   POST /api/v1/rooms/post
// @access  Public
exports.createRoom = catchAsync("createRoom", async (req, res, next) => {
  const { roomNumber, roomType, basePrice, isActive, propertyId } = req.body;

  if (!roomNumber || !roomType || !basePrice || !propertyId) {
    throw new AppError("Please provide roomNumber, roomType, basePrice, and propertyId", 400);
  }

  // Verify property exists
  const propertyExists = await Property.findOne({ _id: propertyId, isDeleted: false });
  if (!propertyExists) {
    throw new AppError("Selected property not found", 404);
  }

  // Check if roomNumber already exists (not soft deleted)
  const roomExists = await Room.findOne({ roomNumber, isDeleted: false });
  if (roomExists) {
    throw new AppError("Room number already exists", 400);
  }

  const room = await Room.create({
    roomNumber,
    roomType,
    basePrice,
    isActive: isActive !== undefined ? isActive : true,
    propertyId,
  });

  successResponse({
    res,
    statusCode: 201,
    data: room,
  });
});

// @desc    Update room details
// @route   POST /api/v1/rooms/put
// @access  Public
exports.updateRoom = catchAsync("updateRoom", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  const { roomNumber, roomType, basePrice, isActive, propertyId, bookingStatus, cleaningStatus } = req.body;

  if (!id) {
    throw new AppError("Please provide a room ID", 400);
  }

  let room = await Room.findOne({ _id: id, isDeleted: false });
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  if (propertyId) {
    const propertyExists = await Property.findOne({ _id: propertyId, isDeleted: false });
    if (!propertyExists) {
      throw new AppError("Selected property not found", 404);
    }
  }

  const updateFields = { roomNumber, roomType, basePrice, isActive, propertyId };
  if (bookingStatus !== undefined) updateFields.bookingStatus = bookingStatus;
  if (cleaningStatus !== undefined) updateFields.cleaningStatus = cleaningStatus;

  room = await Room.findByIdAndUpdate(
    id,
    updateFields,
    { new: true, runValidators: true }
  );

  successResponse({
    res,
    data: room,
  });
});

// @desc    Delete room
// @route   POST /api/v1/rooms/delete
// @access  Public
exports.deleteRoom = catchAsync("deleteRoom", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a room ID", 400);
  }

  const room = await Room.findOne({ _id: id, isDeleted: false });
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  // Soft delete room
  room.isDeleted = true;
  room.isActive = false;
  await room.save();

  successResponse({
    res,
    message: "Room deleted successfully (soft deleted)",
  });
});
