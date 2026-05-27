const VehicleMaintenance = require("../models/VehicleMaintenance");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");
const { getPagination } = require("../utils/paginationHelper");

// Helper function to delete file safely
const safeDeleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// @desc    Get all vehicle maintenance records
// @route   GET /api/vehicle-maintenance/get
// @access  Private
exports.getVehicleMaintenances = catchAsync("getVehicleMaintenances", async (req, res, next) => {
  const { vehicleId, isResolved, createdBy } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (vehicleId) filter.vehicleId = vehicleId;
  if (createdBy) filter.createdBy = createdBy;
  if (isResolved !== undefined) {
    filter.isResolved = isResolved === "true";
  }

  const total = await VehicleMaintenance.countDocuments(filter);
  const records = await VehicleMaintenance.find(filter)
    .populate("vehicleId", "vehicleName vehicleType vehicleNumber")
    .populate("createdBy", "name email role")
    .populate("resolvedBy", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: records, other: buildMeta(total) });
});

// @desc    Get single vehicle maintenance record by ID
// @route   GET /api/vehicle-maintenance/getid/:id
// @access  Private
exports.getVehicleMaintenance = catchAsync("getVehicleMaintenance", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) throw new AppError("Please provide a vehicle maintenance ID", 400);

  const record = await VehicleMaintenance.findOne({ _id: id, isDeleted: false })
    .populate("vehicleId", "vehicleName vehicleType vehicleNumber")
    .populate("createdBy", "name email role")
    .populate("resolvedBy", "name email role");

  if (!record) throw new AppError("Vehicle maintenance record not found", 404);

  successResponse({ res, data: record });
});

// @desc    Create new vehicle maintenance record
// @route   POST /api/vehicle-maintenance/post
// @access  Private
exports.createVehicleMaintenance = catchAsync("createVehicleMaintenance", async (req, res, next) => {
  let uploadedPath = null;
  try {
    const { vehicleId, title, description, amount, isResolved, resolvedRemarks, resolvedBy } = req.body;

    if (!vehicleId || !title || !description || amount === undefined) {
      throw new AppError("Please provide all required maintenance details", 400);
    }

    // Process uploaded file (bill) if present
    if (req.file) {
      uploadedPath = `/uploads/${req.file.filename}`;
    }

    // Verify vehicle exists
    const vehicleExists = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
    if (!vehicleExists) {
      throw new AppError("Selected vehicle not found", 404);
    }

    // Verify resolvedBy exists if provided
    let verifiedResolvedBy = null;
    if (resolvedBy) {
      const resolvedByUser = await User.findById(resolvedBy);
      if (!resolvedByUser) {
        throw new AppError("Resolver user not found", 404);
      }
      verifiedResolvedBy = resolvedBy;
    }

    const record = await VehicleMaintenance.create({
      vehicleId,
      createdBy: req.body.createdBy || req.user._id,
      title,
      description,
      amount,
      isResolved: isResolved !== undefined ? isResolved : false,
      resolvedRemarks: resolvedRemarks || null,
      resolvedBy: verifiedResolvedBy,
      bill: uploadedPath,
    });

    const populatedRecord = await VehicleMaintenance.findById(record._id)
      .populate("vehicleId", "vehicleName vehicleType vehicleNumber")
      .populate("createdBy", "name email role")
      .populate("resolvedBy", "name email role");

    successResponse({
      res,
      statusCode: 201,
      message: "Vehicle maintenance record added successfully",
      data: populatedRecord,
    });
  } catch (error) {
    // Clean up uploaded bill file if error occurred
    if (uploadedPath) safeDeleteFile(uploadedPath);
    throw error;
  }
});

// @desc    Update vehicle maintenance record
// @route   PUT /api/vehicle-maintenance/put/:id
// @access  Private
exports.updateVehicleMaintenance = catchAsync("updateVehicleMaintenance", async (req, res, next) => {
  let newUploadedPath = null;
  try {
    const id = req.params.id || req.body.id;
    if (!id) throw new AppError("Please provide a vehicle maintenance ID", 400);

    const record = await VehicleMaintenance.findOne({ _id: id, isDeleted: false });
    if (!record) throw new AppError("Vehicle maintenance record not found", 404);

    const {
      vehicleId,
      title,
      description,
      amount,
      isResolved,
      resolvedRemarks,
      resolvedBy,
      removeBill,
    } = req.body;

    // Verify vehicle exists if changing
    if (vehicleId) {
      const vehicleExists = await Vehicle.findOne({ _id: vehicleId, isDeleted: false });
      if (!vehicleExists) {
        throw new AppError("Selected vehicle not found", 404);
      }
      record.vehicleId = vehicleId;
    }

    // Verify resolvedBy exists if changing
    if (resolvedBy) {
      const resolvedByUser = await User.findById(resolvedBy);
      if (!resolvedByUser) {
        throw new AppError("Resolver user not found", 404);
      }
      record.resolvedBy = resolvedBy;
    } else if (resolvedBy === null) {
      record.resolvedBy = null;
    }

    if (title) record.title = title;
    if (description) record.description = description;
    if (amount !== undefined) record.amount = amount;
    if (isResolved !== undefined) record.isResolved = isResolved;
    if (resolvedRemarks !== undefined) record.resolvedRemarks = resolvedRemarks;

    // Handle file upload
    if (req.file) {
      newUploadedPath = `/uploads/${req.file.filename}`;
      // Remove old bill file first if it exists
      if (record.bill) {
        safeDeleteFile(record.bill);
      }
      record.bill = newUploadedPath;
    } else if (removeBill === "true" || removeBill === true) {
      if (record.bill) {
        safeDeleteFile(record.bill);
      }
      record.bill = null;
    }

    await record.save();

    const populatedRecord = await VehicleMaintenance.findById(record._id)
      .populate("vehicleId", "vehicleName vehicleType vehicleNumber")
      .populate("createdBy", "name email role")
      .populate("resolvedBy", "name email role");

    successResponse({
      res,
      message: "Vehicle maintenance record updated successfully",
      data: populatedRecord,
    });
  } catch (error) {
    if (newUploadedPath) safeDeleteFile(newUploadedPath);
    throw error;
  }
});

// @desc    Resolve vehicle maintenance
// @route   PUT /api/vehicle-maintenance/resolve/:id
// @access  Private
exports.resolveVehicleMaintenance = catchAsync("resolveVehicleMaintenance", async (req, res, next) => {
  const id = req.params.id;
  const { resolvedRemarks } = req.body;

  if (!resolvedRemarks) {
    throw new AppError("Please provide resolution remarks", 400);
  }

  const record = await VehicleMaintenance.findOne({ _id: id, isDeleted: false });
  if (!record) throw new AppError("Vehicle maintenance record not found", 404);

  record.isResolved = true;
  record.resolvedRemarks = resolvedRemarks;
  record.resolvedBy = req.user._id;

  await record.save();

  const populatedRecord = await VehicleMaintenance.findById(record._id)
    .populate("vehicleId", "vehicleName vehicleType vehicleNumber")
    .populate("createdBy", "name email role")
    .populate("resolvedBy", "name email role");

  successResponse({
    res,
    message: "Vehicle maintenance resolved successfully",
    data: populatedRecord,
  });
});

// @desc    Soft delete vehicle maintenance record
// @route   DELETE /api/vehicle-maintenance/delete/:id
// @access  Private
exports.deleteVehicleMaintenance = catchAsync("deleteVehicleMaintenance", async (req, res, next) => {
  const id = req.params.id;

  const record = await VehicleMaintenance.findOne({ _id: id, isDeleted: false });
  if (!record) throw new AppError("Vehicle maintenance record not found", 404);

  record.isDeleted = true;
  record.isActive = false;
  await record.save();

  successResponse({
    res,
    message: "Vehicle maintenance record deleted successfully (soft deleted)",
  });
});
