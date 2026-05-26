const User = require("../models/User");
const Role = require("../models/Role");
const StaffProfile = require("../models/StaffProfile");
const CustomerProfile = require("../models/CustomerProfile");
const { HTTP_STATUS, MESSAGES } = require("../constants/constants");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenHelper");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// Helper to format response object neatly
const formatUserResponse = (user, profile) => {
  const userObj = user.toObject ? user.toObject() : user;
  if (userObj.password) delete userObj.password;

  let profileObj = profile && profile.toObject ? profile.toObject() : profile;
  if (profileObj && profileObj.password) delete profileObj.password;

  return {
    ...userObj,
    profile: profileObj || null,
  };
};

// @desc    Register a new CUSTOMER (Staff registration is blocked here!)
// @route   POST /api/v1/login/register
// @access  Public
exports.registerCustomer = catchAsync("registerCustomer", async (req, res, next) => {
  const { name, email, phone, countryCode, address } = req.body;

  if (!name || !email || !phone) {
    throw new AppError("Please provide name, email, and phone number", 400);
  }

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new AppError("Email is already registered", 400);
  }

  // Find the default "customer" role
  let customerRole = await Role.findOne({ name: "customer" });
  if (!customerRole) {
    customerRole = await Role.create({ name: "customer", isActive: true });
  }

  // 1. Create core User
  const user = await User.create({
    name,
    email,
    phone,
    countryCode,
    roleId: customerRole._id,
  });

  // 2. Create Customer Profile
  const profile = await CustomerProfile.create({
    userId: user._id,
    address: address || "",
    isActive: true,
    isDeleted: false,
  });

  // Generate login tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  const populatedUser = await User.findById(user._id).populate("roleId", "_id name");

  successResponse({
    res,
    statusCode: 201,
    message: "Customer registered successfully",
    other: { accessToken, refreshToken },
    data: formatUserResponse(populatedUser, profile),
  });
});

// @desc    Login USER (Staff using Password, Customer using Phone Number) - Role-wise Authentication
// @route   POST /api/v1/login/login
// @access  Public
exports.loginStaff = catchAsync("loginStaff", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(MESSAGES.ERROR.REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Find User by email, select password, and populate role
  const user = await User.findOne({ email }).select("+password").populate("roleId", "name");
  if (!user) {
    throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError(MESSAGES.ERROR.DEACTIVATED, HTTP_STATUS.UNAUTHORIZED);
  }

  // 2. Check if the user's role is "customer"
  const isCustomer = user.roleId && user.roleId.name.toLowerCase() === "customer";

  let profile = null;
  let isMatch = false;

  if (isCustomer) {
    // Find CustomerProfile (must not be soft-deleted)
    profile = await CustomerProfile.findOne({ userId: user._id, isDeleted: false });
    if (!profile) {
      throw new AppError(MESSAGES.ERROR.NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }
    // For customers, their registered phone number acts as their password/credential
    isMatch = (password === user.phone);
  } else {
    // Verify password from User model
    if (!user.password) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    isMatch = await user.matchPassword(password);

    // Fetch staff profile for staff roles other than admin
    const roleName = user.roleId ? user.roleId.name.toLowerCase() : "";
    if (roleName !== "admin") {
      profile = await StaffProfile.findOne({ userId: user._id, isDeleted: false });
    }
  }

  if (!isMatch) {
    throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Generate JWT tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  // 4. Determine role-wise success message
  const roleName = user.roleId ? user.roleId.name : "user";
  const capitalizedRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);

  successResponse({
    res,
    message: `${capitalizedRole} logged in successfully`,
    other: { accessToken, refreshToken },
    data: formatUserResponse(user, profile),
  });
});

// @desc    Get currently logged in user profile
// @route   POST /api/v1/login/me
// @access  Private
exports.getMe = catchAsync("getMe", async (req, res, next) => {
  // req.user has already been populated by authMiddleware!
  successResponse({
    res,
    data: req.user,
  });
});
