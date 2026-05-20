const Driver = require("../models/Driver");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all drivers
// @route   GET /api/driver/get
// @access  Public
exports.getDrivers = catchAsync("getDrivers", async (req, res, next) => {
  const drivers = await Driver.find({ isDeleted: false });
  successResponse({
    res,
    data: drivers,
  });
});

// @desc    Get single driver by ID
// @route   POST /api/driver/getid
// @access  Public
exports.getDriver = catchAsync("getDriver", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a driver ID", 400);
  }

  const driver = await Driver.findOne({ _id: id, isDeleted: false });
  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  successResponse({
    res,
    data: driver,
  });
});

// @desc    Create new driver
// @route   POST /api/driver/post
// @access  Public
exports.createDriver = catchAsync("createDriver", async (req, res, next) => {
  const { name, phone, licenseNumber, isActive } = req.body;

  const phoneExists = await Driver.findOne({ phone, isDeleted: false });
  if (phoneExists) {
    throw new AppError("Phone number is already registered to a driver", 400);
  }

  const licenseExists = await Driver.findOne({ licenseNumber, isDeleted: false });
  if (licenseExists) {
    throw new AppError("License number is already registered to a driver", 400);
  }

  const driver = await Driver.create({
    name,
    phone,
    licenseNumber,
    isActive: isActive !== undefined ? isActive : true,
  });

  successResponse({
    res,
    statusCode: 201,
    data: driver,
  });
});

// @desc    Update driver details
// @route   POST /api/driver/put
// @access  Public
exports.updateDriver = catchAsync("updateDriver", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a driver ID", 400);
  }

  const driver = await Driver.findOne({ _id: id, isDeleted: false });
  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  const { name, phone, licenseNumber, isActive } = req.body;

  driver.name = name || driver.name;
  driver.phone = phone || driver.phone;
  driver.licenseNumber = licenseNumber || driver.licenseNumber;
  driver.isActive = isActive !== undefined ? isActive : driver.isActive;

  await driver.save();

  successResponse({
    res,
    data: driver,
  });
});

// @desc    Delete driver
// @route   POST /api/driver/delete
// @access  Public
exports.deleteDriver = catchAsync("deleteDriver", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a driver ID", 400);
  }

  const driver = await Driver.findOne({ _id: id, isDeleted: false });
  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  driver.isDeleted = true;
  driver.isActive = false;
  await driver.save();

  successResponse({
    res,
    message: "Driver deleted successfully (soft deleted)",
  });
});
