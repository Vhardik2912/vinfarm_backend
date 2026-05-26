const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS, CUSTOMER_STATUS } = require("../constants/booking");
const { syncProfileStatusForCustomer } = require("../utils/websiteBookingHelper");
const { sendBookingConfirmationEmail, sendBookingEmails } = require("../utils/emailHelper");
const { getPagination } = require("../utils/paginationHelper");

// ─── Helper: Calculate nights ──────────────────────────────────────────────────
const calculateNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// @desc    Get all bookings (with filters: status, date range, customer)
// @route   GET /api/booking/get?page=1&limit=10
// @access  Private
exports.getBookings = catchAsync("getBookings", async (req, res, next) => {
  const { bookingStatus, paymentStatus, customerId, startDate, endDate } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (bookingStatus) filter.bookingStatus = bookingStatus;
  if (paymentStatus) filter["payment.status"] = paymentStatus;
  if (customerId) filter.customerId = customerId;
  if (startDate || endDate) {
    filter.checkInDate = {};
    if (startDate) filter.checkInDate.$gte = new Date(startDate);
    if (endDate) filter.checkInDate.$lte = new Date(endDate);
  }

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate("customerId", "name email phone")
    .populate("createdBy", "name email phone")
    .populate("roomId", "roomNumber roomType basePrice")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: bookings, other: buildMeta(total) });
});

// @desc    Get single booking by ID
// @route   GET /api/booking/getid/:id
// @access  Private
exports.getBooking = catchAsync("getBooking", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) throw new AppError("Please provide a booking ID", 400);

  const booking = await Booking.findOne({ _id: id, isDeleted: false })
    .populate("customerId", "name email phone")
    .populate("createdBy", "name email phone")
    .populate("roomId", "roomNumber roomType basePrice");

  if (!booking) throw new AppError("Booking not found", 404);

  successResponse({ res, data: booking });
});

// @desc    Create new booking (Instant or Pending Approval)
// @route   POST /api/booking/post
// @access  Private
exports.createBooking = catchAsync("createBooking", async (req, res, next) => {
  const {
    customerId,
    createdBy,
    bookingSource,
    roomId,
    roomSnapshot,
    guests,
    totalGuests,
    checkInDate,
    checkOutDate,
    services,
    pricing,
    discountCode,
    payment,
    instantBooking, // if true → confirmed; if false → pending
  } = req.body;

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

  // Check for date conflicts
  const conflictingBooking = await Booking.findOne({
    roomId,
    isDeleted: false,
    bookingStatus: {
      $in: [
        ROOM_BOOKING_STATUS.CONFIRMED,
        ROOM_BOOKING_STATUS.CHECKED_IN,
        ROOM_BOOKING_STATUS.PENDING,
      ],
    },
    // Date overlap validation
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });

  if (conflictingBooking) {
    throw new AppError("Room is already booked for the selected dates", 400);
  }

  const status = instantBooking ? ROOM_BOOKING_STATUS.CONFIRMED : ROOM_BOOKING_STATUS.PENDING;

  // Build room snapshot if not provided
  const finalRoomSnapshot = roomSnapshot || {
    roomName: room.roomNumber,
    pricePerNight: room.basePrice,
    capacity: room.capacity || 2,
  };

  const nights = calculateNights(checkIn, checkOut);
  const finalPricing = pricing || {
    baseAmount: room.basePrice * nights,
    serviceAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: room.basePrice * nights,
  };

  const booking = await Booking.create({
    customerId,
    createdBy: createdBy || req.user._id,
    bookingSource: bookingSource || "SELF",
    roomId,
    roomSnapshot: finalRoomSnapshot,
    guests: guests || { adults: 1, children: 0 },
    totalGuests: totalGuests || ((guests?.adults || 1) + (guests?.children || 0)),
    checkInDate: checkIn,
    checkOutDate: checkOut,
    services: services || [],
    pricing: finalPricing,
    discountCode: discountCode || "",
    bookingStatus: status,
    payment: payment || {
      status: PAYMENT_STATUS.PENDING,
      method: "",
      transactionId: "",
    },
  });

  // If instant booking, send confirmation email
  if (instantBooking) {
    await sendBookingConfirmationEmail(booking, room, customer);
  } else {
    await sendBookingEmails(booking, room, customer);
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customerId", "name email phone")
    .populate("createdBy", "name email phone")
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

  await syncProfileStatusForCustomer(booking.customerId, CUSTOMER_STATUS.CONFIRMED);

  // Send confirmation email
  const customer = await User.findById(booking.customerId);
  const room = await Room.findById(booking.roomId);
  if (customer && customer.email && room) {
    await sendBookingConfirmationEmail(booking, room, customer);
  }

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

  successResponse({ res, message: "Guest checked out successfully", data: booking });
});

// @desc    Update booking (Modify Booking)
// @route   PUT /api/booking/put/:id
// @access  Private
exports.updateBooking = catchAsync("updateBooking", async (req, res, next) => {
  const id = req.params.id;
  const {
    guests,
    totalGuests,
    checkInDate,
    checkOutDate,
    actualCheckIn,
    actualCheckOut,
    services,
    pricing,
    discountCode,
    bookingStatus,
    payment,
    cancellation,
    refund,
  } = req.body;

  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);

  if ([ROOM_BOOKING_STATUS.CANCELLED, ROOM_BOOKING_STATUS.CHECKED_OUT].includes(booking.bookingStatus)) {
    throw new AppError("Cannot modify a cancelled or checked-out booking", 400);
  }

  if (guests) {
    booking.guests = { ...booking.guests, ...guests };
    if (totalGuests === undefined) {
      booking.totalGuests = (booking.guests.adults || 1) + (booking.guests.children || 0);
    }
  }
  if (totalGuests !== undefined) booking.totalGuests = totalGuests;

  if (checkInDate) booking.checkInDate = new Date(checkInDate);
  if (checkOutDate) booking.checkOutDate = new Date(checkOutDate);
  if (actualCheckIn) booking.actualCheckIn = new Date(actualCheckIn);
  if (actualCheckOut) booking.actualCheckOut = new Date(actualCheckOut);
  if (services) booking.services = services;

  if (pricing) {
    booking.pricing = { ...booking.pricing, ...pricing };
  }
  if (discountCode !== undefined) booking.discountCode = discountCode;
  if (bookingStatus) booking.bookingStatus = bookingStatus;

  if (payment) {
    booking.payment = { ...booking.payment, ...payment };
  }
  if (cancellation) {
    booking.cancellation = { ...booking.cancellation, ...cancellation };
  }
  if (refund) {
    booking.refund = { ...booking.refund, ...refund };
  }

  // Recalculate base/final pricing if dates or snapshot prices changed
  if (checkInDate || checkOutDate) {
    const pricePerNight = booking.roomSnapshot?.pricePerNight || 0;
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const baseAmt = pricePerNight * nights;
    
    booking.pricing = {
      ...booking.pricing,
      baseAmount: baseAmt,
      finalAmount: Math.max(0, baseAmt + (booking.pricing?.serviceAmount || 0) + (booking.pricing?.taxAmount || 0) - (booking.pricing?.discountAmount || 0)),
    };
  }

  await booking.save();

  successResponse({ res, message: "Booking updated successfully", data: booking });
});

// @desc    Record Payment for a booking
// @route   PUT /api/booking/payment/:id
// @access  Private (Staff/Admin)
exports.recordPayment = catchAsync("recordPayment", async (req, res, next) => {
  const id = req.params.id;
  const { paymentMethod, paymentAmount, transactionId } = req.body;

  if (!paymentMethod) throw new AppError("Please provide payment method", 400);

  const booking = await Booking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Booking not found", 404);

  booking.payment = {
    status: PAYMENT_STATUS.PAID,
    method: paymentMethod,
    transactionId: transactionId || booking.payment?.transactionId || "",
    paidAt: new Date(),
  };

  if (paymentAmount) {
    booking.pricing = {
      ...booking.pricing,
      finalAmount: paymentAmount,
    };
  }

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
  booking.cancellation = {
    reason: cancellationReason || "Cancelled by user",
    cancelledAt: new Date(),
  };

  // Process refund request if applicable
  if (refundAmount !== undefined && refundAmount > 0) {
    booking.refund = {
      amount: refundAmount,
      status: REFUND_STATUS.REQUESTED,
    };
  }

  await booking.save();

  await syncProfileStatusForCustomer(booking.customerId, CUSTOMER_STATUS.CANCELLED);

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
  if (booking.refund?.status === REFUND_STATUS.PROCESSED) {
    throw new AppError("Refund has already been processed", 400);
  }

  const finalAmount = booking.pricing?.finalAmount || 0;
  const finalRefundAmount = refundAmount || booking.refund?.amount || finalAmount;

  booking.refund = {
    amount: finalRefundAmount,
    status: REFUND_STATUS.PROCESSED,
    processedAt: new Date(),
  };

  booking.payment = {
    ...booking.payment,
    status: finalRefundAmount >= finalAmount
      ? PAYMENT_STATUS.REFUNDED
      : PAYMENT_STATUS.PARTIALLY_REFUNDED,
  };

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

  const availableRooms = await Room.find(roomFilter).select("roomNumber roomType basePrice");

  successResponse({
    res,
    message: `${availableRooms.length} room(s) available`,
    data: availableRooms,
  });
});
