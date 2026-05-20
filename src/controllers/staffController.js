const User = require("../models/User");
const Role = require("../models/Role");
const StaffProfile = require("../models/StaffProfile");
const Designation = require("../models/Designation");
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

// Helper to format staff object neatly
const formatStaff = (profile) => {
  if (!profile) return null;
  const obj = profile.toObject ? profile.toObject() : profile;
  const user = obj.userId;
  delete obj.userId;

  return {
    _id: user?._id || null,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    isActive: user?.isActive ?? true,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    profile: {
      profileId: obj._id,
      designationId: obj.designationId,
      joinDate: obj.joinDate,
      endDate: obj.endDate,
      salary: obj.salary,
      idProof: obj.idProof,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    }
  };
};

// @desc    Get all staff (with User and Role populated)
// @route   GET /api/v1/staff/get
// @access  Public
exports.getStaffs = catchAsync("getStaffs", async (req, res, next) => {
  const staffProfiles = await StaffProfile.find().populate({
    path: "userId",
    match: { isDeleted: false }
  }).populate("designationId", "name status");

  const formattedStaffs = staffProfiles
    .filter(p => p.userId !== null) // Filter out any orphaned or deleted profiles
    .map(formatStaff);

  successResponse({
    res,
    data: formattedStaffs,
  });
});

// @desc    Get single staff profile by User ID or Profile ID
// @route   POST /api/v1/staff/getid
// @access  Public
exports.getStaff = catchAsync("getStaff", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const staffProfile = await StaffProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  }).populate({
    path: "userId",
    match: { isDeleted: false }
  }).populate("designationId", "name status");

  if (!staffProfile || !staffProfile.userId) {
    throw new AppError("Staff not found", 404);
  }

  successResponse({
    res,
    data: formatStaff(staffProfile),
  });
});

// @desc    Create new staff member (User + StaffProfile)
// @route   POST /api/v1/staff/post
// @access  Public
exports.createStaff = catchAsync("createStaff", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      designationId,
      isActive,
      joinDate,
      endDate,
      salary,
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !designationId || !joinDate || !salary) {
      throw new AppError("Please provide all required staff details", 400);
    }

    if (!req.file) {
      throw new AppError("Please upload an ID proof document", 400);
    }

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError("Email is already registered", 400);
    }

    // Find or create default "staff" role
    let staffRole = await Role.findOne({ name: "staff" });
    if (!staffRole) {
      staffRole = await Role.create({ name: "staff", status: true });
    }

    // Verify designation exists
    const designationDoc = await Designation.findById(designationId);
    if (!designationDoc) {
      throw new AppError("Selected designation not found", 404);
    }

    // Create Core User account
    const user = await User.create({
      name,
      email,
      phone,
      password,
      roleId: staffRole._id,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Create Staff Profile
    const profile = await StaffProfile.create({
      userId: user._id,
      designationId: designationId,
      joinDate,
      endDate: endDate || null,
      salary,
      idProof: `/uploads/${req.file.filename}`,
    });

    // Populate designation for response
    const populatedUser = await User.findById(user._id);
    const tempProfile = await StaffProfile.findById(profile._id).populate("designationId", "name status");

    successResponse({
      res,
      statusCode: 201,
      data: formatStaff({ userId: populatedUser, ...tempProfile.toObject() }),
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    throw error;
  }
});

// @desc    Update staff member details
// @route   POST /api/v1/staff/put
// @access  Public
exports.updateStaff = catchAsync("updateStaff", async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const {
      name,
      email,
      phone,
      isActive,
      designationId,
      password,
      joinDate,
      endDate,
      salary,
    } = req.body;

    if (!id) {
      throw new AppError("Please provide a user or profile ID", 400);
    }

    // Find staff profile first
    let staffProfile = await StaffProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    });

    if (!staffProfile) {
      throw new AppError("Staff profile not found", 404);
    }

    // Find and update User
    const user = await User.findOne({ _id: staffProfile.userId, isDeleted: false });
    if (!user) {
      throw new AppError("Associated staff user account not found", 404);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    if (password) user.password = password;
    await user.save();

    // Update Staff Profile fields
    if (designationId) staffProfile.designationId = designationId;
    if (joinDate) staffProfile.joinDate = joinDate;
    if (endDate !== undefined) staffProfile.endDate = endDate === "" ? null : endDate;
    if (salary) staffProfile.salary = salary;

    // Handle new ID Proof file upload
    if (req.file) {
      if (staffProfile.idProof) {
        safeDeleteFile(staffProfile.idProof);
      }
      staffProfile.idProof = `/uploads/${req.file.filename}`;
    }

    await staffProfile.save();

    const populatedUser = await User.findById(user._id);
    const updatedProfile = await StaffProfile.findById(staffProfile._id).populate("designationId", "name status");

    successResponse({
      res,
      data: formatStaff({ userId: populatedUser, ...updatedProfile.toObject() }),
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    throw error;
  }
});

// @desc    Delete staff member (and files)
// @route   POST /api/v1/staff/delete
// @access  Public
exports.deleteStaff = catchAsync("deleteStaff", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const staffProfile = await StaffProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  });

  if (!staffProfile) {
    throw new AppError("Staff profile not found", 404);
  }

  const user = await User.findOne({ _id: staffProfile.userId, isDeleted: false });
  if (!user) {
    throw new AppError("Associated staff user account not found", 404);
  }

  // Soft delete associated user
  user.isDeleted = true;
  user.isActive = false;
  await user.save();

  successResponse({
    res,
    message: "Staff member deleted successfully (soft deleted)",
  });
});
