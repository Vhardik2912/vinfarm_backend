const VehicleBooking = require("../models/VehicleBooking");
const { VEHICLE_BOOKING_STATUS } = require("../constants/booking");
const Vehicle  = require("../models/Vehicle");
const Property = require("../models/Property");
const User     = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { getPagination } = require("../utils/paginationHelper");

// ─── @desc  Get all vehicle bookings (with filters)
// ─── @route GET /api/vehicle-booking/get?page=1&limit=10
// ─── @access Private
exports.getVehicleBookings = catchAsync("getVehicleBookings", async (req, res) => {
  const { status, customerId, vehicleId, propertyId } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (status)     filter.status     = status;
  if (customerId) filter.customerId = customerId;
  if (vehicleId)  filter.vehicleId  = vehicleId;
  if (propertyId) filter.propertyId = propertyId;

  const total = await VehicleBooking.countDocuments(filter);
  const bookings = await VehicleBooking.find(filter)
    .populate("vehicleId",  "vehicleName vehicleType vehicleNumber")
    .populate("propertyId", "name")
    .populate("customerId", "name email phone")
    .populate("createdBy",  "name email")
    .populate("assignedTo", "name email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: bookings, other: buildMeta(total) });
});

// ─── @desc  Get single vehicle booking
// ─── @route GET /api/vehicle-booking/getid/:id
// ─── @access Private
exports.getVehicleBooking = catchAsync("getVehicleBooking", async (req, res) => {
  const id = req.params.id;

  const booking = await VehicleBooking.findOne({ _id: id, isDeleted: false })
    .populate("vehicleId",  "vehicleName vehicleType vehicleNumber")
    .populate("propertyId", "name")
    .populate("customerId", "name email phone")
    .populate("createdBy",  "name email")
    .populate("assignedTo", "name email phone");

  if (!booking) throw new AppError("Vehicle booking not found", 404);
  successResponse({ res, data: booking });
});

// ─── @desc  Create vehicle booking
// ─── @route POST /api/vehicle-booking/post
// ─── @access Private
exports.createVehicleBooking = catchAsync("createVehicleBooking", async (req, res) => {
  const {
    vehicleId,
    propertyId,
    customerId,
    assignedTo,
    pickupPoint,
    dropPoint,
    pickupTime,
    dropTime,
    price,
    status,
  } = req.body;

  // ─── Validate References ───────────────────────────────────────
  const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false, isActive: true });
  if (!vehicle) throw new AppError("Vehicle not found or inactive", 404);

  const property = await Property.findOne({ _id: propertyId, isDeleted: false, isActive: true });
  if (!property) throw new AppError("Property not found or inactive", 404);

  const customer = await User.findById(customerId);
  if (!customer) throw new AppError("Customer not found", 404);

  if (assignedTo) {
    const staff = await User.findById(assignedTo);
    if (!staff) throw new AppError("Assigned staff not found", 404);
  }

  // ─── Time validation ───────────────────────────────────────────
  const pTime = new Date(pickupTime);
  if (dropTime && new Date(dropTime) <= pTime) {
    throw new AppError("Drop time must be after pickup time", 400);
  }

  // ─── Check vehicle conflict for same time ──────────────────────
  const conflict = await VehicleBooking.findOne({
    vehicleId,
    isDeleted: false,
    status: { $in: [VEHICLE_BOOKING_STATUS.CONFIRMED, VEHICLE_BOOKING_STATUS.ONGOING, VEHICLE_BOOKING_STATUS.PENDING] },
    pickupTime: { $lt: dropTime ? new Date(dropTime) : new Date(pTime.getTime() + 3600000) },
    $or: [
      { dropTime: null },
      { dropTime: { $gt: pTime } },
    ],
  });

  if (conflict) {
    throw new AppError("Vehicle is already booked for the selected time slot", 400);
  }

  const booking = await VehicleBooking.create({
    vehicleId,
    propertyId,
    customerId,
    createdBy:  req.body.createdBy || req.user._id,
    assignedTo: assignedTo || null,
    pickupPoint,
    dropPoint,
    pickupTime:  pTime,
    dropTime:    dropTime ? new Date(dropTime) : null,
    price,
    status:      status || VEHICLE_BOOKING_STATUS.PENDING,
  });

  const populated = await VehicleBooking.findById(booking._id)
    .populate("vehicleId",  "vehicleName vehicleType vehicleNumber")
    .populate("propertyId", "name")
    .populate("customerId", "name email phone")
    .populate("createdBy",  "name email")
    .populate("assignedTo", "name email phone");

  successResponse({ res, statusCode: 201, message: "Vehicle booking created successfully", data: populated });
});

// ─── @desc  Update vehicle booking
// ─── @route PUT /api/vehicle-booking/put/:id
// ─── @access Private
exports.updateVehicleBooking = catchAsync("updateVehicleBooking", async (req, res) => {
  const id = req.params.id;

  const booking = await VehicleBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Vehicle booking not found", 404);

  if ([VEHICLE_BOOKING_STATUS.COMPLETED, VEHICLE_BOOKING_STATUS.CANCELLED].includes(booking.status)) {
    throw new AppError("Cannot modify a completed or cancelled vehicle booking", 400);
  }

  const {
    vehicleId, propertyId, customerId, assignedTo,
    pickupPoint, dropPoint, pickupTime, dropTime, price, status,
  } = req.body;

  if (vehicleId)   booking.vehicleId   = vehicleId;
  if (propertyId)  booking.propertyId  = propertyId;
  if (customerId)  booking.customerId  = customerId;
  if (assignedTo !== undefined) booking.assignedTo = assignedTo || null;
  if (pickupPoint) booking.pickupPoint = pickupPoint;
  if (dropPoint)   booking.dropPoint   = dropPoint;
  if (pickupTime)  booking.pickupTime  = new Date(pickupTime);
  if (dropTime !== undefined) booking.dropTime = dropTime ? new Date(dropTime) : null;
  if (price !== undefined)  booking.price  = price;
  if (status)      booking.status      = status;

  await booking.save();

  const populated = await VehicleBooking.findById(booking._id)
    .populate("vehicleId",  "vehicleName vehicleType vehicleNumber")
    .populate("propertyId", "name")
    .populate("customerId", "name email phone")
    .populate("createdBy",  "name email")
    .populate("assignedTo", "name email phone");

  successResponse({ res, message: "Vehicle booking updated successfully", data: populated });
});

// ─── @desc  Assign staff to vehicle booking
// ─── @route PUT /api/vehicle-booking/assign/:id
// ─── @access Private (Admin/Staff)
exports.assignVehicleBooking = catchAsync("assignVehicleBooking", async (req, res) => {
  const id = req.params.id;
  const { assignedTo } = req.body;

  if (!assignedTo) throw new AppError("Please provide assignedTo (staff user ID)", 400);

  const booking = await VehicleBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Vehicle booking not found", 404);

  const staff = await User.findById(assignedTo);
  if (!staff) throw new AppError("Assigned staff not found", 404);

  booking.assignedTo = assignedTo;
  booking.status     = VEHICLE_BOOKING_STATUS.CONFIRMED;
  await booking.save();

  successResponse({ res, message: "Vehicle assigned and booking confirmed", data: booking });
});

// ─── @desc  Update status (start/complete trip)
// ─── @route PUT /api/vehicle-booking/status/:id
// ─── @access Private (Staff)
exports.updateVehicleBookingStatus = catchAsync("updateVehicleBookingStatus", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) throw new AppError("Please provide a status", 400);
  if (!Object.values(VEHICLE_BOOKING_STATUS).includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${Object.values(VEHICLE_BOOKING_STATUS).join(", ")}`, 400);
  }

  const booking = await VehicleBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Vehicle booking not found", 404);

  booking.status = status;
  if (status === VEHICLE_BOOKING_STATUS.COMPLETED && !booking.dropTime) {
    booking.dropTime = new Date();
  }

  await booking.save();
  successResponse({ res, message: `Vehicle booking status updated to '${status}'`, data: booking });
});

// ─── @desc  Soft delete vehicle booking
// ─── @route DELETE /api/vehicle-booking/delete/:id
// ─── @access Private
exports.deleteVehicleBooking = catchAsync("deleteVehicleBooking", async (req, res) => {
  const id = req.params.id;

  const booking = await VehicleBooking.findOne({ _id: id, isDeleted: false });
  if (!booking) throw new AppError("Vehicle booking not found", 404);

  if (booking.status === VEHICLE_BOOKING_STATUS.ONGOING) {
    throw new AppError("Cannot delete an ongoing vehicle booking", 400);
  }

  booking.isDeleted = false;
  booking.isActive  = false;
  booking.status    = VEHICLE_BOOKING_STATUS.CANCELLED;
  await booking.save();

  successResponse({ res, message: "Vehicle booking cancelled and removed successfully" });
});
