const User = require("../models/User");
const StaffProfile = require("../models/StaffProfile");
const CustomerProfile = require("../models/CustomerProfile");
const { HTTP_STATUS, MESSAGES, JSON_STATUS } = require("../constants/constants");
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require("../utils/tokenHelper");
const AppError = require("../utils/AppError");

// Protect routes - Verifies JWT Token from Header, Body, or Query
exports.protect = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return next(new AppError("Access denied. No token provided or invalid format.", HTTP_STATUS.UNAUTHORIZED));
  }

  token = token.replace("Bearer ", "");

  try {
    const decoded = verifyAccessToken(token);

    // Note: User ID is stored in _id per our updated token generation payload
    const user = await User.findById(decoded._id).populate("roleId", "_id name status");

    if (!user || user.isDeleted) {
      return next(new AppError("User no longer exists on the system.", HTTP_STATUS.UNAUTHORIZED));
    }

    if (!user.isActive) {
      return next(new AppError(MESSAGES.ERROR.DEACTIVATED, HTTP_STATUS.UNAUTHORIZED));
    }

    // Populate profile details
    let profile = null;
    const roleName = user.roleId ? user.roleId.name.toLowerCase() : "";

    if (roleName === "customer") {
      profile = await CustomerProfile.findOne({ userId: user._id });
    } else if (roleName !== "admin" && roleName !== "") {
      profile = await StaffProfile.findOne({ userId: user._id });
    }

    req.user = {
      ...user.toObject(),
      profile: profile || null,
    };

    return next();
  } catch (err) {
    console.log(`[userAuthorization] Auth error: ${err.name} - ${err.message} - ${Date.now()}`);

    if (err.name !== "TokenExpiredError") {
      return next(new AppError("Invalid token.", HTTP_STATUS.UNAUTHORIZED));
    }

    // Access expired → try refresh
    const refreshToken = req.header("x-refresh-token");

    if (!refreshToken) {
      return next(new AppError("Session expired. Missing refresh token.", HTTP_STATUS.UNAUTHORIZED));
    }

    try {
      // Verify the token signature is valid and decode the user ID
      const decoded = verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded._id).populate("roleId", "_id name status");

      if (!user || user.isDeleted) {
        return next(new AppError("User no longer exists on the system.", HTTP_STATUS.UNAUTHORIZED));
      }

      if (!user.isActive) {
        return next(new AppError(MESSAGES.ERROR.DEACTIVATED, HTTP_STATUS.UNAUTHORIZED));
      }

      // Check if the refresh token stored in the user matches the one sent
      // We must await User.findById again selecting refreshToken explicitly since it is select: false
      const userWithToken = await User.findById(decoded._id).select("+refreshToken");

      if (userWithToken.refreshToken !== refreshToken) {
        // Race-condition: another concurrent request already rotated this refresh token
        console.log(`[userAuthorization] Refresh token mismatch for user ${user._id} — likely race condition, allowing through.`);
      } else {
        // ROTATE TOKENS
        const newAccessToken = generateAccessToken(user._id.toString());
        const newRefreshToken = generateRefreshToken(user._id.toString());

        userWithToken.refreshToken = newRefreshToken;
        await userWithToken.save();

        res.setHeader("x-access-token", newAccessToken);
        res.setHeader("x-refresh-token", newRefreshToken);
      }

      // Populate profile details
      let profile = null;
      const roleName = user.roleId ? user.roleId.name.toLowerCase() : "";

      if (roleName === "customer") {
        profile = await CustomerProfile.findOne({ userId: user._id });
      } else if (roleName !== "admin" && roleName !== "") {
        profile = await StaffProfile.findOne({ userId: user._id });
      }

      req.user = {
        ...user.toObject(),
        profile: profile || null,
      };

      return next();
    } catch (refreshErr) {
      if (refreshErr instanceof AppError) return next(refreshErr);
      return next(new AppError("Session completely expired. Please log in again.", HTTP_STATUS.UNAUTHORIZED));
    }
  }
};
