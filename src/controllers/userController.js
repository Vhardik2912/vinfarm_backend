const User = require("../models/User");
const Role = require("../models/Role");
const StaffProfile = require("../models/StaffProfile");
const CustomerProfile = require("../models/CustomerProfile");
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

// @desc    Get all users (populates role + matching profile)
// @route   GET /api/v1/users/get
// @access  Public
exports.getUsers = catchAsync("getUsers", async (req, res, next) => {
  const users = await User.find({ isDeleted: false }).populate("role", "name isActive");
  const populatedUsers = [];

  for (let user of users) {
    let profile = null;
    if (user.role && user.role.name.toLowerCase() === "customer") {
      profile = await CustomerProfile.findOne({ userId: user._id });
    } else {
      profile = await StaffProfile.findOne({ userId: user._id });
    }

    populatedUsers.push({
      ...user.toObject(),
      profile: profile || null,
    });
  }

  successResponse({
    res,
    data: populatedUsers,
  });
});

// @desc    Get single user by ID (populates role + profile)
// @route   POST /api/v1/users/getid
// @access  Public
exports.getUser = catchAsync("getUser", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a user ID", 400);
  }

  const user = await User.findOne({ _id: id, isDeleted: false }).populate("role", "name isActive");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  let profile = null;
  if (user.role && user.role.name.toLowerCase() === "customer") {
    profile = await CustomerProfile.findOne({ userId: user._id });
  } else {
    profile = await StaffProfile.findOne({ userId: user._id });
  }

  successResponse({
    res,
    data: {
      ...user.toObject(),
      profile: profile || null,
    },
  });
});

// @desc    Create new user (with role-based profile routing)
// @route   POST /api/v1/users/post
// @access  Public
exports.createUser = catchAsync("createUser", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      countryCode,
      roleId: roleId,
      isActive,
      // Staff profile fields
      password, // Password is only required for Staff roles
      joindate,
      enddate,
      salary,
      // Customer profile fields
      address,
    } = req.body;

    // 1. Basic validation
    if (!name || !email || !phone || !roleId) {
      throw new AppError("Please provide all required user details", 400);
    }

    // 2. Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError("Email is already registered", 400);
    }

    // 3. Find the user's role to determine profile type
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) {
      throw new AppError("Selected role not found", 404);
    }

    const isCustomer = roleDoc.name.toLowerCase() === "customer";

    // 4. Validation checks based on role
    if (!isCustomer) {
      if (!password) {
        throw new AppError("Please provide a password for Staff", 400);
      }
      if (!req.file) {
        throw new AppError("Please upload an ID proof document for Staff", 400);
      }
    }

    // 5. Create core User account
    const user = await User.create({
      name,
      email,
      phone,
      countryCode,
      password: !isCustomer ? password : null,
      roleId: roleId,
      isActive: isActive !== undefined ? isActive : true,
    });

    let profile = null;

    // 6. Create Profile based on role type
    if (isCustomer) {
      profile = await CustomerProfile.create({
        userId: user._id,
        address: address || "",
      });
    } else {
      profile = await StaffProfile.create({
        userId: user._id,
        email,
        joindate,
        enddate: enddate || null,
        salary,
        idProof: `/uploads/${req.file.filename}`,
      });
    }

    successResponse({
      res,
      statusCode: 201,
      data: {
        ...user.toObject(),
        profile,
      },
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    throw error;
  }
});

// @desc    Update user and their profile details
// @route   POST /api/v1/users/put
// @access  Public
exports.updateUser = catchAsync("updateUser", async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const {
      name,
      email,
      phone,
      countryCode,
      isActive,
      // Staff Profile fields
      password, // Password update for staff
      joindate,
      enddate,
      salary,
      // Customer Profile fields
      address,
    } = req.body;

    if (!id) {
      throw new AppError("Please provide a user ID", 400);
    }

    const user = await User.findById(id).populate("role");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // 1. Update Core User details
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (countryCode !== undefined) user.countryCode = countryCode;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    if (password) user.password = password;
    await user.save();

    let profile = null;
    const isCustomer = user.role && user.role.name.toLowerCase() === "customer";

    // 2. Update matching Profile
    if (isCustomer) {
      profile = await CustomerProfile.findOneAndUpdate(
        { userId: user._id },
        { address: address !== undefined ? address : "" },
        { new: true, upsert: true }
      );
    } else {
      let staffProfile = await StaffProfile.findOne({ userId: user._id });

      if (!staffProfile) {
        staffProfile = new StaffProfile({ userId: user._id, email: user.email });
      }

      // Update staff profile fields
      if (email) staffProfile.email = email;
      if (joindate) staffProfile.joindate = joindate;
      if (enddate !== undefined) staffProfile.enddate = enddate === "" ? null : enddate;
      if (salary) staffProfile.salary = salary;

      // If a new ID Proof file was uploaded
      if (req.file) {
        if (staffProfile.idProof) {
          safeDeleteFile(staffProfile.idProof);
        }
        staffProfile.idProof = `/uploads/${req.file.filename}`;
      }

      await staffProfile.save();
      profile = staffProfile;
    }

    successResponse({
      res,
      data: {
        ...user.toObject(),
        profile,
      },
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    throw error;
  }
});

// @desc    Delete user & their role profile (and files)
// @route   POST /api/v1/users/delete
// @access  Public
exports.deleteUser = catchAsync("deleteUser", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a user ID", 400);
  }

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Soft delete core user account
  user.isDeleted = true;
  user.isActive = false;
  await user.save();

  successResponse({
    res,
    message: "User deleted successfully (soft deleted)",
  });
});
