const TransportBooking = require("../models/TransportBooking");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all transport bookings
// @route   GET /api/transport-booking/get
// @access  Public
exports.getBookings = catchAsync("getBookings", async (req, res, next) => {
  const bookings = await TransportBooking.find({ isDeleted: false })
    .populate("customerId", "name email number")
    .populate("vehicleId", "make model licensePlate type pricePerDay priceAirportTrip")
    .populate("driverId", "name phone licenseNumber");

  successResponse({
    res,
    data: bookings,
  });
});

// @desc    Get single transport booking by ID
// @route   POST /api/transport-booking/getid
// @access  Public
exports.getBooking = catchAsync("getBooking", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a booking ID", 400);
  }

  const booking = await TransportBooking.findOne({ _id: id, isDeleted: false })
    .populate("customerId", "name email number")
    .populate("vehicleId", "make model licensePlate type pricePerDay priceAirportTrip")
    .populate("driverId", "name phone licenseNumber");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  successResponse({
    res,
    data: booking,
  });
});

// @desc    Create new transport booking
// @route   POST /api/transport-booking/post
// @access  Public
exports.createBooking = catchAsync("createBooking", async (req, res, next) => {
  const {
    customerId,
    vehicleId,
    driverId,
    bookingType,
    pickupLocation,
    dropoffLocation,
    pickupDateTime,
    returnDateTime,
    status,
  } = req.body;

  // 1. Verify Customer exists
  const customer = await User.findOne({ _id: customerId, isDeleted: false });
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  // 2. Verify Vehicle exists
  const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  // Check if vehicle is active
  if (!vehicle.isActive) {
    throw new AppError("Vehicle is currently deactivated", 400);
  }

  // 3. Verify Driver if provided
  if (driverId) {
    const driver = await Driver.findOne({ _id: driverId, isDeleted: false, isActive: true });
    if (!driver) {
      throw new AppError("Active driver not found", 404);
    }
  }

  // 4. Calculate total price
  let totalPrice = 0;
  const start = new Date(pickupDateTime);

  if (bookingType === "Car Rental") {
    if (!returnDateTime) {
      throw new AppError("Return date-time is required for Car Rentals", 400);
    }
    const end = new Date(returnDateTime);
    if (end <= start) {
      throw new AppError("Return date-time must be after pickup date-time", 400);
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Minimum 1 day
    totalPrice = diffDays * vehicle.pricePerDay;

    // Add driver service fee (optional flat rate of 500 per day if driver selected)
    if (driverId) {
      totalPrice += diffDays * 500;
    }
  } else {
    // Airport Pickup or Airport Drop
    totalPrice = vehicle.priceAirportTrip;
    // Add driver service fee (optional flat rate of 300 per trip if driver selected)
    if (driverId) {
      totalPrice += 300;
    }
  }

  // 5. Create Booking
  const booking = await TransportBooking.create({
    customerId,
    vehicleId,
    driverId: driverId || null,
    bookingType,
    pickupLocation,
    dropoffLocation,
    pickupDateTime,
    returnDateTime: bookingType === "Car Rental" ? returnDateTime : null,
    status: status || "Pending",
    totalPrice,
  });

  successResponse({
    res,
    statusCode: 201,
    data: booking,
  });
});

// @desc    Update booking details
// @route   POST /api/transport-booking/put
// @access  Public
exports.updateBooking = catchAsync("updateBooking", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a booking ID", 400);
  }

  const booking = await TransportBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const {
    customerId,
    vehicleId,
    driverId,
    bookingType,
    pickupLocation,
    dropoffLocation,
    pickupDateTime,
    returnDateTime,
    status,
    totalPrice,
    isActive,
  } = req.body;

  // Validate foreign references if they are updated
  if (customerId) {
    const customer = await User.findOne({ _id: customerId, isDeleted: false });
    if (!customer) throw new AppError("Customer not found", 404);
    booking.customerId = customerId;
  }

  if (vehicleId) {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
    if (!vehicle) throw new AppError("Vehicle not found", 404);
    booking.vehicleId = vehicleId;
  }

  if (driverId !== undefined) {
    if (driverId) {
      const driver = await Driver.findOne({ _id: driverId, isDeleted: false, isActive: true });
      if (!driver) throw new AppError("Driver not found", 404);
      booking.driverId = driverId;
    } else {
      booking.driverId = null;
    }
  }

  booking.bookingType = bookingType || booking.bookingType;
  booking.pickupLocation = pickupLocation || booking.pickupLocation;
  booking.dropoffLocation = dropoffLocation || booking.dropoffLocation;
  booking.pickupDateTime = pickupDateTime || booking.pickupDateTime;
  booking.returnDateTime = returnDateTime !== undefined ? returnDateTime : booking.returnDateTime;
  booking.status = status || booking.status;
  booking.isActive = isActive !== undefined ? isActive : booking.isActive;

  // Recalculate price if requested, or if custom price was passed in
  if (totalPrice !== undefined) {
    booking.totalPrice = totalPrice;
  } else if (vehicleId || pickupDateTime || returnDateTime || driverId !== undefined) {
    const currentVehicle = await Vehicle.findById(booking.vehicleId);
    const start = new Date(booking.pickupDateTime);
    if (booking.bookingType === "Car Rental" && booking.returnDateTime) {
      const end = new Date(booking.returnDateTime);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      let price = diffDays * currentVehicle.pricePerDay;
      if (booking.driverId) price += diffDays * 500;
      booking.totalPrice = price;
    } else {
      let price = currentVehicle.priceAirportTrip;
      if (booking.driverId) price += 300;
      booking.totalPrice = price;
    }
  }

  await booking.save();

  successResponse({
    res,
    data: booking,
  });
});

// @desc    Delete transport booking
// @route   POST /api/transport-booking/delete
// @access  Public
exports.deleteBooking = catchAsync("deleteBooking", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a booking ID", 400);
  }

  const booking = await TransportBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Soft delete
  booking.isDeleted = true;
  booking.isActive = false;
  await booking.save();

  successResponse({
    res,
    message: "Booking deleted successfully (soft deleted)",
  });
});
