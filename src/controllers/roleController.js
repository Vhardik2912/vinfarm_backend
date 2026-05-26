const Role = require("../models/Role");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all roles
// @route   GET /api/v1/roles/get
// @access  Public
exports.getRoles = catchAsync("getRoles", async (req, res, next) => {
  const roles = await Role.find();
  successResponse({
    res,
    data: roles,
  });
});

// @desc    Get single role
// @route   POST /api/v1/roles/getid or GET /api/v1/roles/getid/:id
// @access  Public
exports.getRole = catchAsync("getRole", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a role ID", 400);
  }

  const role = await Role.findById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  successResponse({
    res,
    data: role,
  });
});

// @desc    Create new role
// @route   POST /api/v1/roles/post
// @access  Public
exports.createRole = catchAsync("createRole", async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    throw new AppError("Please provide a role name", 400);
  }

  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    throw new AppError("Role name already exists", 400);
  }

  const role = await Role.create({ name });

  successResponse({
    res,
    statusCode: 201,
    data: role,
  });
});

// @desc    Update role
// @route   POST /api/v1/roles/put
// @access  Public
exports.updateRole = catchAsync("updateRole", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  const { name } = req.body;

  if (!id) {
    throw new AppError("Please provide a role ID", 400);
  }

  let role = await Role.findById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  role = await Role.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true }
  );

  successResponse({
    res,
    data: role,
  });
});

// @desc    Delete role
// @route   POST /api/v1/roles/delete
// @access  Public
exports.deleteRole = catchAsync("deleteRole", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a role ID", 400);
  }

  const role = await Role.findById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  await Role.findByIdAndDelete(id);

  successResponse({
    res,
    message: "Role deleted successfully",
  });
});
