const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS } = require("../constants/booking");
const { BOOKING_STATUS } = require("../constants/constants");

// ─── Helper: Calculate total amount ────────────────────────────────────────────
const calculateAmount = (basePrice, nights, extraServicesAmount = 0, discountAmount = 0) => {
  const base = basePrice * nights;
  return Math.max(0, base + extraServicesAmount - discountAmount);
};

// ─── Helper: Calculate nights ──────────────────────────────────────────────────
const calculateNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// @desc    Get all bookings (with filters: status, date range, customer)
// @route   GET /api/booking/get
// @access  Private
exports.getBookings = catchAsync("getBookings", async (req, res, next) => {
  const { bookingStatus, paymentStatus, customerId, startDate, endDate } = req.query;
  
  const filter = { isDeleted: false };
  if (bookingStatus) filter.bookingStatus = bookingStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (customerId) filter.customerId = customerId;
  if (startDate || endDate) {
    filter.checkInDate = {};
    if (startDate) filter.checkInDate.$gte = new Date(startDate);
    if (endDate) filter.checkInDate.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(filter)
    .populate("customerId", "name email number")
    .populate("roleId", "name")
    .populate("roomId", "roomNumber roomType basePrice")
    .sort({ createdAt: -1 });

  successResponse({ res, data: bookings });
});

// @desc    Get single booking by ID
// @route   GET /api/booking/getid/:id
// @access  Private
exports.getBooking = catchAsync("getBooking", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) throw new AppError("Please provide a booking ID", 400);

  const booking = await Booking.findOne({ _id: id, isDeleted: false })
    .populate("customerId", "name email number")
    .populate("roleId", "name")
    .populate("roomId", "roomNumber roomType basePrice bookingStatus");

  if (!booking) throw new AppError("Booking not found", 404);

  successResponse({ res, data: booking });
});

// @desc    Create new booking (Instant or Pending Approval)
// @route   POST /api/booking/post
// @access  Private
exports.createBooking = catchAsync("createBooking", async (req, res, next) => {
  const {
    customerId, roleId, roomId,
    checkInDate, checkOutDate,
    numberOfGuests, extraServices, extraServicesAmount,
    specialRequests, discountCode, discountAmount,
    paymentMethod, isGroupBooking, groupSize,
    instantBooking, // if true → confirmed; if false → pending
  } = req.body;

  if (!customerId || !roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    throw new AppError("Please provide customerId, roomId, checkInDate, checkOutDate, numberOfGuests", 400);
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  if (checkOut <= checkIn) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  // Verify customer exists
  const customer = await User.findById(customerId);
  if (!customer) throw new AppError("Customer not found", 404);

  // Verify room exists and is available
  const room = await Room.findOne({ _id: roomId, isDeleted: false });
  if (!room) throw new AppError("Room not found", 404);
  if (room.bookingStatus !== BOOKING_STATUS.AVAILABLE) {
    throw new AppError(`Room is currently ${room.bookingStatus} and not available`, 400);
  }

  // Check for date conflicts
  const conflictingBooking = await Booking.findOne({
    roomId,
    isDeleted: false,
    bookingStatus: { $in: [ROOM_BOOKING_STATUS.CONFIRMED, ROOM_BOOKING_STATUS.CHECKED_IN, ROOM_BOOKING_STATUS.PENDING] },
    $or: [
      { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
    ],
  });
  if (conflictingBooking) {
    throw new AppError("Room is already booked for the selected dates", 400);
  }

  const nights = calculateNights(checkIn, checkOut);
  const extraAmt = extraServicesAmount || 0;
  const discountAmt = discountAmount || 0;
  const baseAmount = room.basePrice * nights;
  const totalAmount = calculateAmount(room.basePrice, nights, extraAmt, discountAmt);

  const status = instantBooking ? ROOM_BOOKING_STATUS.CONFIRMED : ROOM_BOOKING_STATUS.PENDING;

  const booking = await Booking.create({
    customerId,
    roleId: roleId || customer.roleId,
    roomId,
    roomNumber: room.roomNumber,
    roomType: room.roomType,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfGuests,
    extraServices: extraServices || [],
    extraServicesAmount: extraAmt,
    specialRequests: specialRequests || "",
    discountCode: discountCode || null,
    discountAmount: discountAmt,
    baseAmount,
    totalAmount,
    paymentMethod: paymentMethod || null,
    isGroupBooking: isGroupBooking || false,
    groupSize: groupSize || numberOfGuests,
    bookingStatus: status,
  });

  // If instant booking, mark room as Booked
  if (instantBooking) {
    room.bookingStatus = BOOKING_STATUS.BOOKED;
    await room.save();
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customerId", "name email number")
    .populate("roleId", "name")
    .populate("roomId", "roomNumber roomType basePrice");

  successResponse({
    res,
    statusCode: 201,
    message: `Booking ${status} successfully`,
    data: populatedBooking,
  });
});

// @desc    Confirm a pending booking (Booking Approval)
// @route   PUT /api/booking/confirm/:id
// @access  Private (Admin/Staff)
exports.confirmBooking = catchAsync("confirmBooking", async (req, res, next) => {
  const id = req.params.id;
  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.bookingStatus !== ROOM_BOOKING_STATUS.PENDING) {
    throw new AppError(`Booking is already ${booking.bookingStatus}`, 400);
  }

  booking.bookingStatus = ROOM_BOOKING_STATUS.CONFIRMED;
  await booking.save();

  const room = await Room.findById(booking.roomId);
  if (room) { room.bookingStatus = BOOKING_STATUS.BOOKED; await room.save(); }

  successResponse({ res, message: "Booking confirmed successfully", data: booking });
});

// @desc    Check-In a confirmed booking
// @route   PUT /api/booking/checkin/:id
// @access  Private (Staff)
exports.checkIn = catchAsync("checkIn", async (req, res, next) => {
  const id = req.params.id;
  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.bookingStatus !== ROOM_BOOKING_STATUS.CONFIRMED) {
    throw new AppError("Only confirmed bookings can be checked in", 400);
  }

  booking.bookingStatus = ROOM_BOOKING_STATUS.CHECKED_IN;
  booking.actualCheckIn = new Date();
  await booking.save();

  successResponse({ res, message: "Guest checked in successfully", data: booking });
});

// @desc    Check-Out a checked-in booking
// @route   PUT /api/booking/checkout/:id
// @access  Private (Staff)
exports.checkOut = catchAsync("checkOut", async (req, res, next) => {
  const id = req.params.id;
  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.bookingStatus !== ROOM_BOOKING_STATUS.CHECKED_IN) {
    throw new AppError("Only checked-in bookings can be checked out", 400);
  }

  booking.bookingStatus = ROOM_BOOKING_STATUS.CHECKED_OUT;
  booking.actualCheckOut = new Date();
  await booking.save();

  const room = await Room.findById(booking.roomId);
  if (room) { room.bookingStatus = BOOKING_STATUS.AVAILABLE; await room.save(); }

  successResponse({ res, message: "Guest checked out successfully", data: booking });
});

// @desc    Update booking (Modify Booking)
// @route   PUT /api/booking/put/:id
// @access  Private
exports.updateBooking = catchAsync("updateBooking", async (req, res, next) => {
  const id = req.params.id;
  const {
    checkInDate, checkOutDate, numberOfGuests,
    extraServices, extraServicesAmount, specialRequests,
    paymentStatus, paymentMethod, paymentDate,
    isGroupBooking, groupSize,
  } = req.body;

  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);

  if ([ROOM_BOOKING_STATUS.CANCELLED, ROOM_BOOKING_STATUS.CHECKED_OUT].includes(booking.bookingStatus)) {
    throw new AppError("Cannot modify a cancelled or checked-out booking", 400);
  }

  if (checkInDate) booking.checkInDate = new Date(checkInDate);
  if (checkOutDate) booking.checkOutDate = new Date(checkOutDate);
  if (numberOfGuests) booking.numberOfGuests = numberOfGuests;
  if (extraServices) booking.extraServices = extraServices;
  if (extraServicesAmount !== undefined) booking.extraServicesAmount = extraServicesAmount;
  if (specialRequests !== undefined) booking.specialRequests = specialRequests;
  if (isGroupBooking !== undefined) booking.isGroupBooking = isGroupBooking;
  if (groupSize !== undefined) booking.groupSize = groupSize;

  // Recalculate total if dates changed
  if (checkInDate || checkOutDate || extraServicesAmount !== undefined) {
    const room = await Room.findById(booking.roomId);
    if (room) {
      const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
      booking.baseAmount = room.basePrice * nights;
      booking.totalAmount = calculateAmount(room.basePrice, nights, booking.extraServicesAmount, booking.discountAmount);
    }
  }

  // Payment update
  if (paymentStatus) booking.paymentStatus = paymentStatus;
  if (paymentMethod) booking.paymentMethod = paymentMethod;
  if (paymentDate) booking.paymentDate = new Date(paymentDate);

  await booking.save();

  successResponse({ res, message: "Booking updated successfully", data: booking });
});

// @desc    Record Payment for a booking
// @route   PUT /api/booking/payment/:id
// @access  Private (Staff/Admin)
exports.recordPayment = catchAsync("recordPayment", async (req, res, next) => {
  const id = req.params.id;
  const { paymentMethod, paymentAmount } = req.body;

  if (!paymentMethod) throw new AppError("Please provide payment method", 400);

  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);

  booking.paymentStatus = PAYMENT_STATUS.PAID;
  booking.paymentMethod = paymentMethod;
  booking.paymentDate = new Date();
  if (paymentAmount) booking.totalAmount = paymentAmount;

  await booking.save();

  successResponse({ res, message: "Payment recorded successfully", data: booking });
});

// @desc    Cancel a booking
// @route   DELETE /api/booking/delete/:id
// @access  Private
exports.cancelBooking = catchAsync("cancelBooking", async (req, res, next) => {
  const id = req.params.id;
  const { cancellationReason, refundAmount } = req.body;

  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);

  if ([ROOM_BOOKING_STATUS.CANCELLED, ROOM_BOOKING_STATUS.CHECKED_OUT].includes(booking.bookingStatus)) {
    throw new AppError(`Booking is already ${booking.bookingStatus}`, 400);
  }

  booking.bookingStatus = ROOM_BOOKING_STATUS.CANCELLED;
  booking.cancellationReason = cancellationReason || "Cancelled by user";
  booking.cancelledAt = new Date();

  // Process refund if applicable
  if (refundAmount !== undefined && refundAmount > 0) {
    booking.refundAmount = refundAmount;
    booking.refundStatus = REFUND_STATUS.REQUESTED;
  }

  // Free up the room
  const room = await Room.findById(booking.roomId);
  if (room && room.bookingStatus === BOOKING_STATUS.BOOKED) {
    room.bookingStatus = BOOKING_STATUS.AVAILABLE;
    await room.save();
  }

  await booking.save();

  successResponse({ res, message: "Booking cancelled successfully", data: booking });
});

// @desc    Process refund for a cancelled booking
// @route   PUT /api/booking/refund/:id
// @access  Private (Admin)
exports.processRefund = catchAsync("processRefund", async (req, res, next) => {
  const id = req.params.id;
  const { refundAmount } = req.body;

  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.bookingStatus !== ROOM_BOOKING_STATUS.CANCELLED) {
    throw new AppError("Refund can only be processed for cancelled bookings", 400);
  }
  if (booking.refundStatus === REFUND_STATUS.PROCESSED) {
    throw new AppError("Refund has already been processed", 400);
  }

  booking.refundAmount = refundAmount || booking.totalAmount;
  booking.refundStatus = REFUND_STATUS.PROCESSED;
  booking.refundProcessedAt = new Date();
  booking.paymentStatus = refundAmount >= booking.totalAmount
    ? PAYMENT_STATUS.REFUNDED
    : PAYMENT_STATUS.PARTIALLY_REFUNDED;

  await booking.save();

  successResponse({ res, message: "Refund processed successfully", data: booking });
});

// @desc    Get live room availability for a date range
// @route   GET /api/booking/availability
// @access  Public
exports.getRoomAvailability = catchAsync("getRoomAvailability", async (req, res, next) => {
  const { checkInDate, checkOutDate, roomType } = req.query;

  if (!checkInDate || !checkOutDate) {
    throw new AppError("Please provide checkInDate and checkOutDate", 400);
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // Find all rooms booked during this period
  const bookedRoomIds = await Booking.distinct("roomId", {
    isDeleted: false,
    bookingStatus: { $in: [ROOM_BOOKING_STATUS.CONFIRMED, ROOM_BOOKING_STATUS.CHECKED_IN, ROOM_BOOKING_STATUS.PENDING] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });

  const roomFilter = { isDeleted: false, _id: { $nin: bookedRoomIds } };
  if (roomType) roomFilter.roomType = roomType;

  const availableRooms = await Room.find(roomFilter).select("roomNumber roomType basePrice bookingStatus");

  successResponse({
    res,
    message: `${availableRooms.length} room(s) available`,
    data: availableRooms,
  });
});
