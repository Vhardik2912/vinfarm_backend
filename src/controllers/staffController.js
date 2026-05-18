const User = require("../models/User");
const Role = require("../models/Role");
const StaffProfile = require("../models/StaffProfile");
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
  const obj = profile.toObject();
  const user = obj.userId;
  delete obj.userId;
  
  return {
    _id: user?._id || null,
    name: user?.name || "",
    email: user?.email || "",
    number: user?.number || "",
    role: user?.role || null,
    status: user?.status ?? true,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    profile: {
      profileId: obj._id,
      joindate: obj.joindate,
      enddate: obj.enddate,
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
exports.getStaffs = async (req, res, next) => {
  try {
    const staffProfiles = await StaffProfile.find().populate({
      path: "userId",
      populate: { path: "role", select: "name status" }
    });

    const formattedStaffs = staffProfiles
      .filter(p => p.userId !== null) // Filter out any orphaned profiles
      .map(formatStaff);

    res.status(200).json({
      success: true,
      count: formattedStaffs.length,
      data: formattedStaffs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single staff profile by User ID or Profile ID
// @route   POST /api/v1/staff/getid
// @access  Public
exports.getStaff = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide an ID" });
    }

    const staffProfile = await StaffProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    }).populate({
      path: "userId",
      populate: { path: "role", select: "name status" }
    });

    if (!staffProfile || !staffProfile.userId) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.status(200).json({
      success: true,
      data: formatStaff(staffProfile),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new staff member (User + StaffProfile)
// @route   POST /api/v1/staff/post
// @access  Public
exports.createStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      number,
      password,
      role: roleId,
      status,
      joindate,
      enddate,
      salary,
    } = req.body;

    // Validation
    if (!name || !email || !number || !password || !roleId || !joindate || !salary) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Please provide all required staff details" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an ID proof document" });
    }

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Verify role exists
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) {
      safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Selected role not found" });
    }

    // Create Core User account
    const user = await User.create({
      name,
      email,
      number,
      role: roleId,
      status: status !== undefined ? status : true,
    });

    // Create Staff Profile
    const profile = await StaffProfile.create({
      userId: user._id,
      password,
      joindate,
      enddate: enddate || null,
      salary,
      idProof: `/uploads/${req.file.filename}`,
    });

    // Populate role for response
    const populatedUser = await User.findById(user._id).populate("role", "name status");
    const tempProfile = await StaffProfile.findById(profile._id); // Exclude password from view

    res.status(201).json({
      success: true,
      data: formatStaff({ userId: populatedUser, ...tempProfile.toObject() }),
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update staff member details
// @route   POST /api/v1/staff/put
// @access  Public
exports.updateStaff = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const {
      name,
      email,
      number,
      status,
      password,
      joindate,
      enddate,
      salary,
    } = req.body;

    if (!id) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Please provide a user or profile ID" });
    }

    // Find staff profile first
    let staffProfile = await StaffProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    });

    if (!staffProfile) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Staff profile not found" });
    }

    // Find and update User
    const user = await User.findById(staffProfile.userId);
    if (!user) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Associated staff user account not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.number = number || user.number;
    user.status = status !== undefined ? status : user.status;
    await user.save();

    // Update Staff Profile fields
    if (password) staffProfile.password = password;
    if (joindate) staffProfile.joindate = joindate;
    if (enddate !== undefined) staffProfile.enddate = enddate === "" ? null : enddate;
    if (salary) staffProfile.salary = salary;

    // Handle new ID Proof file upload
    if (req.file) {
      if (staffProfile.idProof) {
        safeDeleteFile(staffProfile.idProof);
      }
      staffProfile.idProof = `/uploads/${req.file.filename}`;
    }

    await staffProfile.save();

    const populatedUser = await User.findById(user._id).populate("role", "name status");
    const updatedProfile = await StaffProfile.findById(staffProfile._id);

    res.status(200).json({
      success: true,
      data: formatStaff({ userId: populatedUser, ...updatedProfile.toObject() }),
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete staff member (and files)
// @route   POST /api/v1/staff/delete
// @access  Public
exports.deleteStaff = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide an ID" });
    }

    const staffProfile = await StaffProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    });

    if (!staffProfile) {
      return res.status(404).json({ success: false, message: "Staff profile not found" });
    }

    // 1. Delete associated uploaded ID proof file
    safeDeleteFile(staffProfile.idProof);

    // 2. Delete StaffProfile document
    await StaffProfile.findByIdAndDelete(staffProfile._id);

    // 3. Delete Core User document
    await User.findByIdAndDelete(staffProfile.userId);

    res.status(200).json({
      success: true,
      message: "Staff member and profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
