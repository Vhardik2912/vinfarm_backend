const FarmBooking = require("../models/FarmBooking");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { FARM_BOOKING_STATUS } = require("../constants/constants");

// Daily base rate for renting the entire farmhouse
const DAILY_FARM_RATE = 15000;

// Addons rates
const ADDON_RATES = {
  swimmingPool: 2500,
  cateringPerGuest: 800,
  liveDJ: 6000,
  bonfire: 1500,
  decoration: 4000,
};

// Helper to calculate pricing
const calculateFarmBookingPrice = (startDate, endDate, guestsCount, addons) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const basePrice = DAILY_FARM_RATE * totalDays;
  
  let addonPrice = 0;
  if (addons) {
    if (addons.swimmingPool) addonPrice += ADDON_RATES.swimmingPool;
    if (addons.catering) addonPrice += (ADDON_RATES.cateringPerGuest * guestsCount * totalDays);
    if (addons.liveDJ) addonPrice += ADDON_RATES.liveDJ;
    if (addons.bonfire) addonPrice += ADDON_RATES.bonfire;
    if (addons.decoration) addonPrice += ADDON_RATES.decoration;
  }

  const totalPrice = basePrice + addonPrice;

  return {
    totalDays,
    basePrice,
    addonPrice,
    totalPrice,
  };
};

// @desc    Get all Farm bookings
// @route   GET /api/farm-booking/get
// @access  Public
exports.getFarmBookings = catchAsync("getFarmBookings", async (req, res, next) => {
  const bookings = await FarmBooking.find({ isDeleted: false })
    .populate("customerId", "name email phone")
    .sort({ createdAt: -1 });

  successResponse({
    res,
    data: bookings,
  });
});

// @desc    Get single Farm booking
// @route   GET /api/farm-booking/getid/:id
// @access  Public
exports.getFarmBooking = catchAsync("getFarmBooking", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a booking ID", 400);
  }

  const booking = await FarmBooking.findOne({ _id: id, isDeleted: false })
    .populate("customerId", "name email phone");

  if (!booking) {
    throw new AppError("Farm booking not found", 404);
  }

  successResponse({
    res,
    data: booking,
  });
});

// @desc    Create Farm booking
// @route   POST /api/farm-booking/post
// @access  Public
exports.createFarmBooking = catchAsync("createFarmBooking", async (req, res, next) => {
  const {
    customerId,
    startDate,
    endDate,
    guestsCount,
    eventType,
    addons,
    paymentMethod,
    specialInstructions,
  } = req.body;

  if (!customerId || !startDate || !endDate || !guestsCount) {
    throw new AppError("Please fill in customerId, startDate, endDate, and guestsCount", 400);
  }

  // Verify Customer
  const customer = await User.findById(customerId);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new AppError("End date must be after start date", 400);
  }

  // Check for date conflicts (the whole farmhouse is rented, so only 1 booking can exist at a time)
  const conflict = await FarmBooking.findOne({
    isDeleted: false,
    bookingStatus: { $in: [FARM_BOOKING_STATUS.CONFIRMED, FARM_BOOKING_STATUS.PENDING, FARM_BOOKING_STATUS.CHECKED_IN] },
    $or: [
      { startDate: { $lt: end }, endDate: { $gt: start } },
    ],
  });

  if (conflict) {
    throw new AppError("The farmhouse is already booked or reserved for the selected date range", 400);
  }

  // Calculate Days and Pricing
  const pricing = calculateFarmBookingPrice(startDate, endDate, guestsCount, addons);

  const booking = await FarmBooking.create({
    customerId,
    startDate: start,
    endDate: end,
    totalDays: pricing.totalDays,
    guestsCount,
    eventType: eventType || "Staycation",
    addons: addons || {},
    basePrice: pricing.basePrice,
    addonPrice: pricing.addonPrice,
    totalPrice: pricing.totalPrice,
    paymentMethod: paymentMethod || "Cash",
    specialInstructions: specialInstructions || "",
  });

  const populatedBooking = await FarmBooking.findById(booking._id).populate("customerId", "name email phone");

  successResponse({
    res,
    statusCode: 201,
    message: "Farmhouse booking created successfully",
    data: populatedBooking,
  });
});

// @desc    Update Farm booking details
// @route   PUT /api/farm-booking/put/:id
// @access  Public
exports.updateFarmBooking = catchAsync("updateFarmBooking", async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Please provide a booking ID", 400);
  }

  const booking = await FarmBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) {
    throw new AppError("Farm booking not found", 404);
  }

  const {
    startDate,
    endDate,
    guestsCount,
    eventType,
    addons,
    bookingStatus,
    paymentStatus,
    paymentMethod,
    specialInstructions,
    status,
  } = req.body;

  // If changing dates, check for conflicts
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : booking.startDate;
    const end = endDate ? new Date(endDate) : booking.endDate;

    if (start >= end) {
      throw new AppError("End date must be after start date", 400);
    }

    const conflict = await FarmBooking.findOne({
      _id: { $ne: id },
      isDeleted: false,
      bookingStatus: { $in: [FARM_BOOKING_STATUS.CONFIRMED, FARM_BOOKING_STATUS.PENDING, FARM_BOOKING_STATUS.CHECKED_IN] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (conflict) {
      throw new AppError("The farmhouse is already booked or reserved for the selected date range", 400);
    }

    booking.startDate = start;
    booking.endDate = end;
  }

  if (guestsCount) booking.guestsCount = guestsCount;
  if (eventType) booking.eventType = eventType;
  if (addons) booking.addons = { ...booking.addons, ...addons };
  if (bookingStatus) booking.bookingStatus = bookingStatus;
  if (paymentStatus) booking.paymentStatus = paymentStatus;
  if (paymentMethod) booking.paymentMethod = paymentMethod;
  if (specialInstructions !== undefined) booking.specialInstructions = specialInstructions;
  if (status !== undefined) booking.status = status;

  // Recalculate pricing
  const pricing = calculateFarmBookingPrice(booking.startDate, booking.endDate, booking.guestsCount, booking.addons);
  booking.totalDays = pricing.totalDays;
  booking.basePrice = pricing.basePrice;
  booking.addonPrice = pricing.addonPrice;
  booking.totalPrice = pricing.totalPrice;

  await booking.save();

  const populatedBooking = await FarmBooking.findById(booking._id).populate("customerId", "name email phone");

  successResponse({
    res,
    message: "Farmhouse booking updated successfully",
    data: populatedBooking,
  });
});

// @desc    Delete Farm booking (Soft Delete)
// @route   DELETE /api/farm-booking/delete/:id
// @access  Public
exports.deleteFarmBooking = catchAsync("deleteFarmBooking", async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Please provide a booking ID", 400);
  }

  const booking = await FarmBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) {
    throw new AppError("Farm booking not found", 404);
  }

  booking.isDeleted = true;
  booking.bookingStatus = FARM_BOOKING_STATUS.CANCELLED;
  await booking.save();

  successResponse({
    res,
    message: "Farmhouse booking soft-deleted/cancelled successfully",
  });
});
