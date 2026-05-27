const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Property = require("../models/Property");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { ROOM_BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS, CUSTOMER_STATUS } = require("../constants/booking");
const { syncProfileStatusForCustomer } = require("../utils/websiteBookingHelper");
const { sendBookingConfirmationEmail, sendBookingEmails } = require("../utils/emailHelper");
const { getPagination } = require("../utils/paginationHelper");

// ─── Helper: Calculate nights ──────────────────────────────────────────────────
const calculateNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
    filter["dates.checkInDate"] = {};
    if (startDate) filter["dates.checkInDate"].$gte = new Date(startDate);
    if (endDate) filter["dates.checkInDate"].$lte = new Date(endDate);
  }

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate("customerId", "name email phone")
    .populate("createdBy", "name email phone")
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
    .populate("createdBy", "name email phone");

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
    accommodation, // { type: "ROOM" | "PROPERTY", roomType, refId, name, price, capacity }
    guests,        // { adults, children, totalGuests }
    dates,         // { checkInDate, checkOutDate, actualCheckIn, actualCheckOut }
    pricing,
    discountCode,
    payment,
    instantBooking, // if true → confirmed; if false → pending
  } = req.body;

  const checkIn = new Date(dates.checkInDate);
  const checkOut = new Date(dates.checkOutDate);
  if (checkOut <= checkIn) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  // Verify customer exists
  const customer = await User.findById(customerId);
  if (!customer) throw new AppError("Customer not found", 404);

  // ─── Validate accommodation.refId against the correct collection ──────────
  if (accommodation.type === "ROOM") {
    const room = await Room.findOne({ _id: accommodation.refId, isDeleted: false, isActive: true });
    if (!room) throw new AppError("Selected room not found or is not available", 404);
    // Auto-fill snapshot from the real room document
    accommodation.roomType = accommodation.roomType || room.roomType || null;
    accommodation.name     = `${room.roomType} - ${room.roomNumber}`;
    accommodation.price    = accommodation.price ?? room.basePrice;
    accommodation.capacity = accommodation.capacity ?? 1;
  } else if (accommodation.type === "PROPERTY") {
    const property = await Property.findOne({ _id: accommodation.refId, isDeleted: false, isActive: true });
    if (!property) throw new AppError("Selected property not found or is not available", 404);
    // Auto-fill snapshot from the real property document
    accommodation.roomType = null; // not applicable for property
    accommodation.name     = accommodation.name || property.name;
    accommodation.price    = accommodation.price;
    accommodation.capacity = accommodation.capacity;
  } else {
    throw new AppError("accommodation.type must be either 'ROOM' or 'PROPERTY'", 400);
  }

  // Check for date conflicts on the specific accommodation
  const conflictingBooking = await Booking.findOne({
    "accommodation.refId": accommodation.refId,
    isDeleted: false,
    bookingStatus: {
      $in: [
        ROOM_BOOKING_STATUS.CONFIRMED,
        ROOM_BOOKING_STATUS.CHECKED_IN,
        ROOM_BOOKING_STATUS.PENDING,
      ],
    },
    // Date overlap validation
    "dates.checkInDate": { $lt: checkOut },
    "dates.checkOutDate": { $gt: checkIn },
  });

  if (conflictingBooking) {
    throw new AppError("Accommodation is already booked for the selected dates", 400);
  }

  const status = instantBooking ? ROOM_BOOKING_STATUS.CONFIRMED : ROOM_BOOKING_STATUS.PENDING;

  const nights = calculateNights(checkIn, checkOut);
  const finalPricing = pricing || {
    baseAmount: accommodation.price * nights,
    serviceAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: accommodation.price * nights,
  };

  const booking = await Booking.create({
    customerId,
    createdBy: createdBy || req.user._id,
    bookingSource: bookingSource || "SELF",
    accommodation,
    guests: {
      adults: guests.adults,
      children: guests.children || 0,
      totalGuests: guests.totalGuests || (guests.adults + (guests.children || 0)),
    },
    dates: {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      actualCheckIn: dates.actualCheckIn ? new Date(dates.actualCheckIn) : null,
      actualCheckOut: dates.actualCheckOut ? new Date(dates.actualCheckOut) : null,
    },
    pricing: finalPricing,
    discountCode: discountCode || "",
    bookingStatus: status,
    payment: payment || {
      status: PAYMENT_STATUS.PENDING,
      method: "",
      transactionId: "",
    },
  });

  // Resolve target accommodation details for email sending
  let accommodationObj = null;
  if (accommodation.type === "ROOM") {
    accommodationObj = await Room.findById(accommodation.refId);
  } else if (accommodation.type === "PROPERTY") {
    accommodationObj = await Property.findById(accommodation.refId);
  }

  const emailRoom = {
    roomType: accommodationObj ? (accommodationObj.roomType || accommodationObj.name) : accommodation.name,
    roomNumber: accommodationObj ? (accommodationObj.roomNumber || "—") : "—",
  };

  // If instant booking, send confirmation email
  if (instantBooking) {
    await sendBookingConfirmationEmail(booking, emailRoom, customer);
  } else {
    await sendBookingEmails(booking, emailRoom, customer);
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customerId", "name email phone")
    .populate("createdBy", "name email phone");

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
  let accommodationObj = null;
  if (booking.accommodation?.type === "ROOM") {
    accommodationObj = await Room.findById(booking.accommodation.refId);
  } else if (booking.accommodation?.type === "PROPERTY") {
    accommodationObj = await Property.findById(booking.accommodation.refId);
  }

  const emailRoom = {
    roomType: accommodationObj ? (accommodationObj.roomType || accommodationObj.name) : (booking.accommodation?.name || "—"),
    roomNumber: accommodationObj ? (accommodationObj.roomNumber || "—") : "—",
  };

  if (customer && customer.email) {
    await sendBookingConfirmationEmail(booking, emailRoom, customer);
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
  booking.dates = {
    ...booking.dates.toObject(),
    actualCheckIn: new Date(),
  };
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
  booking.dates = {
    ...booking.dates.toObject(),
    actualCheckOut: new Date(),
  };
  await booking.save();

  successResponse({ res, message: "Guest checked out successfully", data: booking });
});

// @desc    Update booking (Modify Booking)
// @route   PUT /api/booking/put/:id
// @access  Private
exports.updateBooking = catchAsync("updateBooking", async (req, res, next) => {
  const id = req.params.id;
  const {
    accommodation,
    guests,
    dates,
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

  if (accommodation) {
    // ─── Re-validate refId whenever accommodation is being updated ───────────
    const newType  = accommodation.type  || booking.accommodation.type;
    const newRefId = accommodation.refId || booking.accommodation.refId;

    if (newType === "ROOM") {
      const room = await Room.findOne({ _id: newRefId, isDeleted: false, isActive: true });
      if (!room) throw new AppError("Selected room not found or is not available", 404);
      // Refresh snapshot name/price/roomType from the real room document
      accommodation.roomType = accommodation.roomType || room.roomType || null;
      accommodation.name     = accommodation.name  || `${room.roomType} - ${room.roomNumber}`;
      accommodation.price    = accommodation.price || room.basePrice;
    } else if (newType === "PROPERTY") {
      const property = await Property.findOne({ _id: newRefId, isDeleted: false, isActive: true });
      if (!property) throw new AppError("Selected property not found or is not available", 404);
      accommodation.roomType = null; // not applicable for property
      accommodation.name     = accommodation.name || property.name;
    } else {
      throw new AppError("accommodation.type must be either 'ROOM' or 'PROPERTY'", 400);
    }

    booking.accommodation = { ...booking.accommodation.toObject(), ...accommodation };
  }

  if (guests) {
    const adults = guests.adults !== undefined ? guests.adults : booking.guests.adults;
    const children = guests.children !== undefined ? guests.children : booking.guests.children;
    const totalGuests = guests.totalGuests !== undefined ? guests.totalGuests : (adults + children);
    booking.guests = {
      adults,
      children,
      totalGuests,
    };
  }

  if (dates) {
    booking.dates = { ...booking.dates.toObject(), ...dates };
  }

  if (pricing) {
    booking.pricing = { ...booking.pricing.toObject(), ...pricing };
  }
  if (discountCode !== undefined) booking.discountCode = discountCode;
  if (bookingStatus) booking.bookingStatus = bookingStatus;

  if (payment) {
    booking.payment = { ...booking.payment.toObject(), ...payment };
  }
  if (cancellation) {
    booking.cancellation = { ...booking.cancellation.toObject(), ...cancellation };
  }
  if (refund) {
    booking.refund = { ...booking.refund.toObject(), ...refund };
  }

  // Recalculate base/final pricing if dates or snapshot prices changed
  if (dates?.checkInDate || dates?.checkOutDate || accommodation?.price) {
    const pricePerNight = booking.accommodation?.price || 0;
    const nights = calculateNights(booking.dates.checkInDate, booking.dates.checkOutDate);
    const baseAmt = pricePerNight * nights;
    
    booking.pricing = {
      ...booking.pricing.toObject(),
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
      ...booking.pricing.toObject(),
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
    ...booking.payment.toObject(),
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
  const bookedRoomIds = await Booking.distinct("accommodation.refId", {
    isDeleted: false,
    "accommodation.type": "ROOM",
    bookingStatus: { $in: [ROOM_BOOKING_STATUS.CONFIRMED, ROOM_BOOKING_STATUS.CHECKED_IN, ROOM_BOOKING_STATUS.PENDING] },
    "dates.checkInDate": { $lt: checkOut },
    "dates.checkOutDate": { $gt: checkIn },
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
