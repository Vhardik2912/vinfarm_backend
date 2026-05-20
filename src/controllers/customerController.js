const User = require("../models/User");
const Role = require("../models/Role");
const CustomerProfile = require("../models/CustomerProfile");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// Helper to format customer object neatly
const formatCustomer = (profile) => {
  if (!profile) return null;
  const obj = profile.toObject ? profile.toObject() : profile;
  const user = obj.userId;
  delete obj.userId;
  
  return {
    _id: user?._id || null,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleId: user?.roleId || null,
    status: user?.status ?? true,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    profile: {
      profileId: obj._id,
      address: obj.address,
      loyaltyPoints: obj.loyaltyPoints,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    }
  };
};

// @desc    Get all customers (with User and Role populated)
// @route   GET /api/v1/customers/get
// @access  Public
exports.getCustomers = catchAsync("getCustomers", async (req, res, next) => {
  const customerProfiles = await CustomerProfile.find().populate({
    path: "userId",
    populate: { path: "roleId", select: "name status" }
  });

  const formattedCustomers = customerProfiles
    .filter(p => p.userId !== null) // Filter out orphaned profiles
    .map(formatCustomer);

  successResponse({
    res,
    data: formattedCustomers,
  });
});

// @desc    Get single customer profile by User ID or Profile ID
// @route   POST /api/v1/customers/getid
// @access  Public
exports.getCustomer = catchAsync("getCustomer", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const customerProfile = await CustomerProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  }).populate({
    path: "userId",
    populate: { path: "roleId", select: "name status" }
  });

  if (!customerProfile || !customerProfile.userId) {
    throw new AppError("Customer not found", 404);
  }

  successResponse({
    res,
    data: formatCustomer(customerProfile),
  });
});

// @desc    Create new customer (User + CustomerProfile)
// @route   POST /api/v1/customers/post
// @access  Public
exports.createCustomer = catchAsync("createCustomer", async (req, res, next) => {
  const {
    name,
    email,
    phone,
    status,
    address,
  } = req.body;

  // Validation
  if (!name || !email || !phone) {
    throw new AppError("Please provide all required customer details", 400);
  }

  // Check if email exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new AppError("Email is already registered", 400);
  }

  // Find or create default "customer" role
  let customerRole = await Role.findOne({ name: "customer" });
  if (!customerRole) {
    customerRole = await Role.create({ name: "customer", status: true });
  }

  // Create Core User account
  const user = await User.create({
    name,
    email,
    phone,
    roleId: customerRole._id,
    status: status !== undefined ? status : true,
  });

  // Create Customer Profile
  const profile = await CustomerProfile.create({
    userId: user._id,
    address: address || "",
  });

  const populatedUser = await User.findById(user._id).populate("roleId", "name status");

  successResponse({
    res,
    statusCode: 201,
    data: formatCustomer({ userId: populatedUser, ...profile.toObject() }),
  });
});

// @desc    Update customer member details
// @route   POST /api/v1/customers/put
// @access  Public
exports.updateCustomer = catchAsync("updateCustomer", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  const {
    name,
    email,
    phone,
    status,
    address,
    loyaltyPoints,
  } = req.body;

  if (!id) {
    throw new AppError("Please provide a user or profile ID", 400);
  }

  // Find customer profile first
  let customerProfile = await CustomerProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  });

  if (!customerProfile) {
    throw new AppError("Customer profile not found", 404);
  }

  // Find and update User
  const user = await User.findById(customerProfile.userId);
  if (!user) {
    throw new AppError("Associated customer user account not found", 404);
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.status = status !== undefined ? status : user.status;
  await user.save();

  // Update Customer Profile fields
  if (address !== undefined) customerProfile.address = address;
  if (loyaltyPoints !== undefined) customerProfile.loyaltyPoints = loyaltyPoints;
  await customerProfile.save();

  const populatedUser = await User.findById(user._id).populate("roleId", "name status");

  successResponse({
    res,
    data: formatCustomer({ userId: populatedUser, ...customerProfile.toObject() }),
  });
});

// @desc    Delete customer member
// @route   POST /api/v1/customers/delete
// @access  Public
exports.deleteCustomer = catchAsync("deleteCustomer", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const customerProfile = await CustomerProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  });

  if (!customerProfile) {
    throw new AppError("Customer profile not found", 404);
  }

  // 1. Delete CustomerProfile document
  await CustomerProfile.findByIdAndDelete(customerProfile._id);

  // 2. Delete Core User document
  await User.findByIdAndDelete(customerProfile.userId);

  successResponse({
    res,
    message: "Customer account and profile deleted successfully",
  });
});
