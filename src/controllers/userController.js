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
  const users = await User.find({ isDeleted: false }).populate("roleId", "name");
  const populatedUsers = [];

  for (let user of users) {
    let profile = null;
    if (user.roleId && user.roleId.name.toLowerCase() === "customer") {
      profile = await CustomerProfile.findOne({ userId: user._id });
    } else if (user.roleId && user.roleId.name.toLowerCase() !== "admin") {
      profile = await StaffProfile.findOne({ userId: user._id }).populate("designationId", "name status");
    }

    const userObj = user.toObject();
    if (Object.prototype.hasOwnProperty.call(userObj, "status")) delete userObj.status;
    populatedUsers.push({
      ...userObj,
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

  const user = await User.findOne({ _id: id, isDeleted: false }).populate("roleId", "name");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  let profile = null;
  if (user.roleId && user.roleId.name.toLowerCase() === "customer") {
    profile = await CustomerProfile.findOne({ userId: user._id });
  } else if (user.roleId && user.roleId.name.toLowerCase() !== "admin") {
    profile = await StaffProfile.findOne({ userId: user._id }).populate("designationId", "name status");
  }

  successResponse({
    res,
    data: {
      ...(() => {
        const o = user.toObject();
        if (Object.prototype.hasOwnProperty.call(o, "status")) delete o.status;
        return o;
      })(),
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
      joinDate,
      endDate,
      salary,
      // Customer profile fields
      address,
      designationId
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
      // if (!req.file) {
      //   throw new AppError("Please upload an ID proof document for Staff", 400);
      // }
    }

    // 5. Create core User account
    const user = await User.create({
      name,
      email,
      phone,
      countryCode,
      designationId,
      password: !isCustomer ? password : null,
      roleId: roleId,
      isActive: isActive !== undefined ? isActive : true,
    });

    let profile = null;

    // 6. Create Profile based on role type
    if (!isCustomer) {
      profile = await StaffProfile.create({
        userId: user._id,
        designationId: designationId || null,
        joinDate: joinDate || new Date(),
        endDate: endDate || null,
        salary: salary || 0,
        idProof: req.file ? `/uploads/${req.file.filename}` : "",
      });
    }

    successResponse({
      res,
      statusCode: 201,
      data: {
        ...(() => {
          const o = user.toObject();
          if (Object.prototype.hasOwnProperty.call(o, "status")) delete o.status;
          return o;
        })(),
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
      roleId,
      designationId,
      isActive,
      password,
      joinDate,
      endDate,
      salary,
      address,
    } = req.body;

    if (!id) {
      throw new AppError("Please provide a user ID", 400);
    }

    const user = await User.findById(id).populate("roleId");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const previousRoleName = user.roleId ? user.roleId.name.toLowerCase() : "";
    let targetRole = user.roleId;

    if (roleId) {
      targetRole = await Role.findById(roleId);
      if (!targetRole) {
        throw new AppError("Selected role not found", 404);
      }
      user.roleId = targetRole._id;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (countryCode !== undefined) user.countryCode = countryCode;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    if (password) user.password = password;
    await user.save();

    const targetRoleName = targetRole.name.toLowerCase();
    const roleChanged = previousRoleName !== targetRoleName;
    let profile = null;

    if (targetRoleName === "customer") {
      if (roleChanged && previousRoleName !== "admin") {
        await StaffProfile.deleteOne({ userId: user._id });
      }
      const existingCustomerProfile = await CustomerProfile.findOne({ userId: user._id });
      if (existingCustomerProfile) {
        profile = await CustomerProfile.findOneAndUpdate(
          { userId: user._id },
          { address: address !== undefined ? address : "" },
          { new: true }
        );
      } else if (address !== undefined) {
        // Do not create a full CustomerProfile here because required booking fields are managed separately.
        profile = null;
      }
    } else if (targetRoleName === "admin") {
      await StaffProfile.deleteOne({ userId: user._id });
      await CustomerProfile.deleteOne({ userId: user._id });
      profile = null;
    } else {
      if (roleChanged && previousRoleName === "customer") {
        await CustomerProfile.deleteOne({ userId: user._id });
      }

      let staffProfile = await StaffProfile.findOne({ userId: user._id });
      if (!staffProfile) {
        staffProfile = new StaffProfile({ userId: user._id });
      }

      if (designationId) staffProfile.designationId = designationId;
      if (joinDate) staffProfile.joinDate = joinDate;
      if (endDate !== undefined) staffProfile.endDate = endDate === "" ? null : endDate;
      if (salary !== undefined) staffProfile.salary = salary;

      if (req.file) {
        if (staffProfile.idProof) {
          safeDeleteFile(staffProfile.idProof);
        }
        staffProfile.idProof = `/uploads/${req.file.filename}`;
      }

      await staffProfile.save();
      profile = await StaffProfile.findById(staffProfile._id).populate("designationId", "name status");
    }

    const populatedUser = await User.findById(user._id).populate("roleId", "name");

    successResponse({
      res,
      data: {
        ...(() => {
          const o = populatedUser.toObject();
          if (Object.prototype.hasOwnProperty.call(o, "status")) delete o.status;
          return o;
        })(),
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
