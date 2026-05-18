const Room = require("../models/Room");

// @desc    Get all rooms
// @route   GET /api/v1/rooms/get
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single room by ID
// @route   POST /api/v1/rooms/getid
// @access  Public
exports.getRoom = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a room ID" });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/v1/rooms/post
// @access  Public
exports.createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, basePrice, bookingStatus, cleaningStatus, status } = req.body;

    if (!roomNumber || !roomType || !basePrice) {
      return res.status(400).json({ success: false, message: "Please provide roomNumber, roomType, and basePrice" });
    }

    // Check if roomNumber already exists
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ success: false, message: "Room number already exists" });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      basePrice,
      bookingStatus,
      cleaningStatus,
      status,
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update room details
// @route   POST /api/v1/rooms/put
// @access  Public
exports.updateRoom = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const { roomNumber, roomType, basePrice, bookingStatus, cleaningStatus, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a room ID" });
    }

    let room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    room = await Room.findByIdAndUpdate(
      id,
      { roomNumber, roomType, basePrice, bookingStatus, cleaningStatus, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete room
// @route   POST /api/v1/rooms/delete
// @access  Public
exports.deleteRoom = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a room ID" });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
