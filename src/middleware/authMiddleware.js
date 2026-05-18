const jwt = require("jsonwebtoken");
const User = require("../models/User");
const StaffProfile = require("../models/StaffProfile");
const CustomerProfile = require("../models/CustomerProfile");

// Protect routes - Verifies JWT Token from Header, Body, or Query
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // 2. Check Request Body (for custom POST workflows)
  else if (req.body && req.body.token) {
    token = req.body.token;
  } 
  // 3. Check Query parameters
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find core User
    const user = await User.findById(decoded.id).populate("role", "name status");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists on the system.",
      });
    }

    // Check if user is active
    if (!user.status) {
      return res.status(401).json({
        success: false,
        message: "User account is suspended/inactive.",
      });
    }

    // Populate profile details
    let profile = null;
    if (user.role && user.role.name.toLowerCase() === "customer") {
      profile = await CustomerProfile.findOne({ userId: user._id });
    } else {
      profile = await StaffProfile.findOne({ userId: user._id });
    }

    // Attach to request
    req.user = {
      ...user.toObject(),
      profile: profile || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token.",
    });
  }
};
