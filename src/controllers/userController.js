const User = require("../models/User");
const Role = require("../models/Role");
const StaffProfile = require("../models/StaffProfile");
const CustomerProfile = require("../models/CustomerProfile");
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
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate("role", "name status");
    const populatedUsers = [];

    for (let user of users) {
      let profile = null;
      if (user.role && user.role.name.toLowerCase() === "customer") {
        profile = await CustomerProfile.findOne({ userId: user._id });
      } else {
        // Query StaffProfile, explicitly selecting the password field if needed (normally hidden)
        profile = await StaffProfile.findOne({ userId: user._id });
      }

      populatedUsers.push({
        ...user.toObject(),
        profile: profile || null,
      });
    }

    res.status(200).json({
      success: true,
      count: populatedUsers.length,
      data: populatedUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user by ID (populates role + profile)
// @route   POST /api/v1/users/getid
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a user ID" });
    }

    const user = await User.findById(id).populate("role", "name status");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profile = null;
    if (user.role && user.role.name.toLowerCase() === "customer") {
      profile = await CustomerProfile.findOne({ userId: user._id });
    } else {
      profile = await StaffProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        profile: profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (with role-based profile routing)
// @route   POST /api/v1/users/post
// @access  Public
exports.createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      number,
      role: roleId,
      status,
      // Staff profile fields
      password, // Password is only required for Staff roles
      joindate,
      enddate,
      salary,
      // Customer profile fields
      address,
    } = req.body;

    // 1. Basic validation
    if (!name || !email || !number || !roleId) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Please provide all required user details" });
    }

    // 2. Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // 3. Find the user's role to determine profile type
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Selected role not found" });
    }

    const isCustomer = roleDoc.name.toLowerCase() === "customer";

    // 4. Validation checks based on role
    if (!isCustomer) {
      if (!password) {
        if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({ success: false, message: "Please provide a password for Staff" });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload an ID proof document for Staff" });
      }
    }

    // 5. Create core User account (NO PASSWORD here!)
    const user = await User.create({
      name,
      email,
      number,
      role: roleId,
      status: status !== undefined ? status : true,
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
        password, // Save password in Staff Profile!
        joindate,
        enddate: enddate || null,
        salary,
        idProof: `/uploads/${req.file.filename}`,
      });

      // Exclude password from the returned profile object
      const profileObj = profile.toObject();
      delete profileObj.password;
      profile = profileObj;
    }

    res.status(201).json({
      success: true,
      data: {
        ...user.toObject(),
        profile,
      },
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user and their profile details
// @route   POST /api/v1/users/put
// @access  Public
exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const {
      name,
      email,
      number,
      status,
      // Staff Profile fields
      password, // Password update for staff
      joindate,
      enddate,
      salary,
      // Customer Profile fields
      address,
    } = req.body;

    if (!id) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Please provide a user ID" });
    }

    const user = await User.findById(id).populate("role");
    if (!user) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Update Core User details
    user.name = name || user.name;
    user.email = email || user.email;
    user.number = number || user.number;
    user.status = status !== undefined ? status : user.status;
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
      // For Staff: We retrieve first to check pre-save password updates correctly
      let staffProfile = await StaffProfile.findOne({ userId: user._id });

      if (!staffProfile) {
        staffProfile = new StaffProfile({ userId: user._id });
      }

      // Update staff profile fields
      if (password) staffProfile.password = password;
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

      // Exclude password from the returned profile object
      const profileObj = staffProfile.toObject();
      delete profileObj.password;
      profile = profileObj;
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        profile,
      },
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete user & their role profile (and files)
// @route   POST /api/v1/users/delete
// @access  Public
exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a user ID" });
    }

    const user = await User.findById(id).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCustomer = user.role && user.role.name.toLowerCase() === "customer";

    // Remove matching Profile & its files
    if (isCustomer) {
      await CustomerProfile.findOneAndDelete({ userId: user._id });
    } else {
      const staffProfile = await StaffProfile.findOne({ userId: user._id });
      if (staffProfile) {
        safeDeleteFile(staffProfile.idProof); // Cleanup file upload
        await StaffProfile.findByIdAndDelete(staffProfile._id);
      }
    }

    // Delete core user account
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "User and role profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
