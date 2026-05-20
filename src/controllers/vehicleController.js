const Vehicle = require("../models/Vehicle");
const FuelLog = require("../models/FuelLog");
const MaintenanceLog = require("../models/MaintenanceLog");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

// Helper function to delete files safely
const safeDeleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicle/get
// @access  Public
exports.getVehicles = catchAsync("getVehicles", async (req, res, next) => {
  const vehicles = await Vehicle.find({ isDeleted: false });
  successResponse({
    res,
    data: vehicles,
  });
});

// @desc    Get single vehicle by ID
// @route   POST /api/vehicle/getid
// @access  Public
exports.getVehicle = catchAsync("getVehicle", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a vehicle ID", 400);
  }

  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  successResponse({
    res,
    data: vehicle,
  });
});

// @desc    Create new vehicle
// @route   POST /api/vehicle/post
// @access  Public
exports.createVehicle = catchAsync("createVehicle", async (req, res, next) => {
  try {
    const { make, model, licensePlate, type, capacity, pricePerDay, priceAirportTrip, status, isActive } = req.body;

    // Check if plate number already exists (not soft deleted)
    const vehicleExists = await Vehicle.findOne({ licensePlate, isDeleted: false });
    if (vehicleExists) {
      throw new AppError("License plate number is already registered", 400);
    }

    let images = [];
    if (req.files) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      licensePlate,
      type,
      capacity,
      pricePerDay,
      priceAirportTrip,
      status,
      isActive: isActive !== undefined ? isActive : true,
      images,
    });

    successResponse({
      res,
      statusCode: 201,
      data: vehicle,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(f => safeDeleteFile(`/uploads/${f.filename}`));
    }
    throw error;
  }
});

// @desc    Update vehicle details
// @route   POST /api/vehicle/put
// @access  Public
exports.updateVehicle = catchAsync("updateVehicle", async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) {
      throw new AppError("Please provide a vehicle ID", 400);
    }

    const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const { make, model, licensePlate, type, capacity, pricePerDay, priceAirportTrip, status, isActive } = req.body;

    vehicle.make = make || vehicle.make;
    vehicle.model = model || vehicle.model;
    vehicle.licensePlate = licensePlate || vehicle.licensePlate;
    vehicle.type = type || vehicle.type;
    vehicle.capacity = capacity !== undefined ? capacity : vehicle.capacity;
    vehicle.pricePerDay = pricePerDay !== undefined ? pricePerDay : vehicle.pricePerDay;
    vehicle.priceAirportTrip = priceAirportTrip !== undefined ? priceAirportTrip : vehicle.priceAirportTrip;
    vehicle.status = status || vehicle.status;
    vehicle.isActive = isActive !== undefined ? isActive : vehicle.isActive;

    // Handle updating/appending images
    if (req.files && req.files.length > 0) {
      vehicle.images.forEach(img => safeDeleteFile(img));
      vehicle.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    await vehicle.save();

    successResponse({
      res,
      data: vehicle,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(f => safeDeleteFile(`/uploads/${f.filename}`));
    }
    throw error;
  }
});

// @desc    Delete vehicle
// @route   POST /api/vehicle/delete
// @access  Public
exports.deleteVehicle = catchAsync("deleteVehicle", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a vehicle ID", 400);
  }

  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  // Soft delete
  vehicle.isDeleted = true;
  vehicle.isActive = false;
  await vehicle.save();

  successResponse({
    res,
    message: "Vehicle deleted successfully (soft deleted)",
  });
});

// ─── FUEL LOG TRACKING ────────────────────────────────────────

// @desc    Add a fuel log for a vehicle
// @route   POST /api/vehicle/fuel/post
// @access  Public
exports.addFuelLog = catchAsync("addFuelLog", async (req, res, next) => {
  const { vehicleId, fuelQuantity, cost, odometerReading } = req.body;

  const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const fuelLog = await FuelLog.create({
    vehicleId,
    fuelQuantity,
    cost,
    odometerReading,
    filledBy: req.user ? req.user._id : null,
  });

  successResponse({
    res,
    statusCode: 201,
    data: fuelLog,
  });
});

// @desc    Get fuel logs for a vehicle
// @route   POST /api/vehicle/fuel/get
// @access  Public
exports.getFuelLogs = catchAsync("getFuelLogs", async (req, res, next) => {
  const { vehicleId } = req.body;
  if (!vehicleId) {
    throw new AppError("Please provide vehicleId", 400);
  }

  const logs = await FuelLog.find({ vehicleId }).sort({ date: -1 });

  successResponse({
    res,
    data: logs,
  });
});

// ─── MAINTENANCE REMINDERS & LOGS ──────────────────────────────

// @desc    Add a maintenance log for a vehicle
// @route   POST /api/vehicle/maintenance/post
// @access  Public
exports.addMaintenanceLog = catchAsync("addMaintenanceLog", async (req, res, next) => {
  const { vehicleId, maintenanceDate, description, cost, odometerReading, nextServiceOdometer } = req.body;

  const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const log = await MaintenanceLog.create({
    vehicleId,
    maintenanceDate,
    description,
    cost,
    odometerReading,
    nextServiceOdometer,
  });

  successResponse({
    res,
    statusCode: 201,
    data: log,
  });
});

// @desc    Get maintenance logs/reminders for a vehicle
// @route   POST /api/vehicle/maintenance/get
// @access  Public
exports.getMaintenanceLogs = catchAsync("getMaintenanceLogs", async (req, res, next) => {
  const { vehicleId } = req.body;
  if (!vehicleId) {
    throw new AppError("Please provide vehicleId", 400);
  }

  const logs = await MaintenanceLog.find({ vehicleId }).sort({ maintenanceDate: -1 });

  successResponse({
    res,
    data: logs,
  });
});
