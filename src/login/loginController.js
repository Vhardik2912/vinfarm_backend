const User = require("../models/User");
const Role = require("../models/Role");
const StaffProfile = require("../models/StaffProfile");
const CustomerProfile = require("../models/CustomerProfile");
const jwt = require("jsonwebtoken");

// Helper function to sign JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

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
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, number, address } = req.body;

    if (!name || !email || !number) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and phone number" });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Find the default "customer" role
    let customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
      customerRole = await Role.create({ name: "customer", status: true });
    }

    // 1. Create core User
    const user = await User.create({
      name,
      email,
      number,
      role: customerRole._id,
      status: true,
    });

    // 2. Create Customer Profile
    const profile = await CustomerProfile.create({
      userId: user._id,
      address: address || "",
    });

    // Generate login token
    const token = generateToken(user._id);
    const populatedUser = await User.findById(user._id).populate("role", "name status");

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      data: formatUserResponse(populatedUser, profile),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login STAFF using Email & Password (Customers are blocked here!)
// @route   POST /api/v1/login/login
// @access  Public
exports.loginStaff = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // 1. Find User by email
    const user = await User.findOne({ email }).populate("role", "name status");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 2. BLOCK customers from logging in here
    if (user.role && user.role.name.toLowerCase() === "customer") {
      return res.status(403).json({ success: false, message: "Access denied. Customer login not permitted here." });
    }

    // Check if account is active
    if (!user.status) {
      return res.status(401).json({ success: false, message: "Your staff account has been deactivated." });
    }

    // 3. Find StaffProfile (with password field explicitly loaded)
    const staffProfile = await StaffProfile.findOne({ userId: user._id }).select("+password");
    if (!staffProfile) {
      return res.status(401).json({ success: false, message: "Invalid credentials / Staff profile not found" });
    }

    // 4. Verify password
    const isMatch = await staffProfile.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 5. Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Staff logged in successfully",
      token,
      data: formatUserResponse(user, staffProfile),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently logged in user profile
// @route   POST /api/v1/login/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user has already been populated by authMiddleware!
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
