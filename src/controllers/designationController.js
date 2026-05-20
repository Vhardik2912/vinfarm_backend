const Designation = require("../models/Designation");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all designations
// @route   GET /api/designation/get
// @access  Public
exports.getDesignations = catchAsync("getDesignations", async (req, res, next) => {
  const designations = await Designation.find({ isDeleted: false });
  
  successResponse({
    res,
    data: designations,
  });
});

// @desc    Get single designation
// @route   POST /api/designation/getid or GET /api/designation/getid/:id
// @access  Public
exports.getDesignation = catchAsync("getDesignation", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a designation ID", 400);
  }

  const designation = await Designation.findById(id);
  if (!designation || designation.isDeleted) {
    throw new AppError("Designation not found", 404);
  }

  successResponse({
    res,
    data: designation,
  });
});

// @desc    Create new designation
// @route   POST /api/designation/post
// @access  Public
exports.createDesignation = catchAsync("createDesignation", async (req, res, next) => {
  const { name, isActive } = req.body;

  if (!name) {
    throw new AppError("Please provide a designation name", 400);
  }

  const designationExists = await Designation.findOne({ name });
  if (designationExists) {
    throw new AppError("Designation already exists", 400);
  }

  const designation = await Designation.create({
    name,
    isActive: isActive !== undefined ? isActive : true,
  });

  successResponse({
    res,
    statusCode: 201,
    message: "Designation created successfully",
    data: designation,
  });
});

// @desc    Update designation details
// @route   POST /api/designation/put
// @access  Public
exports.updateDesignation = catchAsync("updateDesignation", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a designation ID", 400);
  }

  const designation = await Designation.findById(id);
  if (!designation || designation.isDeleted) {
    throw new AppError("Designation not found", 404);
  }

  const { name, isActive } = req.body;

  designation.name = name || designation.name;
  if (isActive !== undefined) designation.isActive = isActive;

  await designation.save();

  successResponse({
    res,
    data: designation,
  });
});

// @desc    Delete designation
// @route   POST /api/designation/delete
// @access  Public
exports.deleteDesignation = catchAsync("deleteDesignation", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a designation ID", 400);
  }

  const designation = await Designation.findById(id);
  if (!designation || designation.isDeleted) {
    throw new AppError("Designation not found", 404);
  }

  designation.isDeleted = true;
  designation.isActive = false;
  await designation.save();

  successResponse({
    res,
    message: "Designation deleted successfully",
  });
});
