const Vehicle = require("../models/Vehicle");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

// Helper function to delete file safely
const safeDeleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// Helper function to delete multiple files safely
const safeDeleteFiles = (filePaths) => {
  if (filePaths && filePaths.length > 0) {
    filePaths.forEach((filePath) => {
      safeDeleteFile(filePath);
    });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicle/get
// @access  Private
exports.getVehicles = catchAsync("getVehicles", async (req, res, next) => {
  const filter = { isDeleted: false };
  
  const vehicles = await Vehicle.find(filter);

  successResponse({
    res,
    data: vehicles,
  });
});

// @desc    Get single vehicle by ID
// @route   POST /api/vehicle/getid or GET /api/vehicle/getid/:id
// @access  Private
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
// @access  Private
exports.createVehicle = catchAsync("createVehicle", async (req, res, next) => {
  let uploadedPaths = [];
  try {
    const { vehicleName, vehicleType, vehicleNumber, vehicleCapacity, isActive } = req.body;

    if (!vehicleName || !vehicleType || !vehicleNumber || !vehicleCapacity) {
      throw new AppError("Please provide all required vehicle details", 400);
    }

    // Process files if uploaded
    if (req.files && req.files.length > 0) {
      uploadedPaths = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Check if vehicleNumber already exists (not soft deleted)
    const vehicleExists = await Vehicle.findOne({ vehicleNumber, isDeleted: false });
    if (vehicleExists) {
      throw new AppError("Vehicle number already exists", 400);
    }

    const vehicle = await Vehicle.create({
      vehicleName,
      vehicleType,
      vehicleNumber,
      vehicleCapacity,
      isActive: isActive !== undefined ? isActive : true,
      document: uploadedPaths,
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id);

    successResponse({
      res,
      statusCode: 201,
      message: "Vehicle added successfully",
      data: populatedVehicle,
    });
  } catch (error) {
    // If any error occurs, safely delete the newly uploaded files
    safeDeleteFiles(uploadedPaths);
    throw error;
  }
});

// @desc    Update vehicle details
// @route   POST /api/vehicle/put or PUT /api/vehicle/put/:id
// @access  Private
exports.updateVehicle = catchAsync("updateVehicle", async (req, res, next) => {
  let newUploadedPaths = [];
  try {
    const id = req.params.id || req.body.id;
    const { vehicleName, vehicleType, vehicleNumber, vehicleCapacity, isActive, removeDocuments } = req.body;

    if (!id) {
      throw new AppError("Please provide a vehicle ID", 400);
    }

    const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    // Check vehicleNumber unique constraint if it's changing
    if (vehicleNumber && vehicleNumber !== vehicle.vehicleNumber) {
      const vehicleExists = await Vehicle.findOne({ vehicleNumber, isDeleted: false });
      if (vehicleExists) {
        throw new AppError("Vehicle number already exists", 400);
      }
      vehicle.vehicleNumber = vehicleNumber;
    }

    if (vehicleName) vehicle.vehicleName = vehicleName;
    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (vehicleCapacity) vehicle.vehicleCapacity = vehicleCapacity;
    if (isActive !== undefined) vehicle.isActive = isActive;

    // Process newly uploaded files
    if (req.files && req.files.length > 0) {
      newUploadedPaths = req.files.map((file) => `/uploads/${file.filename}`);
      vehicle.document.push(...newUploadedPaths);
    }

    // Optional: Handle removal of specific documents if provided
    if (removeDocuments) {
      const docsToRemove = Array.isArray(removeDocuments) ? removeDocuments : [removeDocuments];
      docsToRemove.forEach((docPath) => {
        // Safe delete from storage
        safeDeleteFile(docPath);
        // Remove from document array in DB
        vehicle.document = vehicle.document.filter((path) => path !== docPath);
      });
    }

    await vehicle.save();

    const populatedVehicle = await Vehicle.findById(vehicle._id);

    successResponse({
      res,
      message: "Vehicle updated successfully",
      data: populatedVehicle,
    });
  } catch (error) {
    // If any error occurs, safely delete the newly uploaded files
    safeDeleteFiles(newUploadedPaths);
    throw error;
  }
});

// @desc    Delete vehicle
// @route   POST /api/vehicle/delete or DELETE /api/vehicle/delete/:id
// @access  Private
exports.deleteVehicle = catchAsync("deleteVehicle", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a vehicle ID", 400);
  }

  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  // Soft delete vehicle
  vehicle.isDeleted = true;
  vehicle.isActive = false;
  await vehicle.save();

  successResponse({
    res,
    message: "Vehicle deleted successfully (soft deleted)",
  });
});
