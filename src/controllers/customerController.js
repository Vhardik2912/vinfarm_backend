const User = require("../models/User");
const Role = require("../models/Role");
const CustomerProfile = require("../models/CustomerProfile");

// Helper to format customer object neatly
const formatCustomer = (profile) => {
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
      address: obj.address,
      loyaltyPoints: obj.loyaltyPoints,
      bookingHistory: obj.bookingHistory,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    }
  };
};

// @desc    Get all customers (with User and Role populated)
// @route   GET /api/v1/customers/get
// @access  Public
exports.getCustomers = async (req, res, next) => {
  try {
    const customerProfiles = await CustomerProfile.find().populate({
      path: "userId",
      populate: { path: "role", select: "name status" }
    });

    const formattedCustomers = customerProfiles
      .filter(p => p.userId !== null) // Filter out orphaned profiles
      .map(formatCustomer);

    res.status(200).json({
      success: true,
      count: formattedCustomers.length,
      data: formattedCustomers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer profile by User ID or Profile ID
// @route   POST /api/v1/customers/getid
// @access  Public
exports.getCustomer = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide an ID" });
    }

    const customerProfile = await CustomerProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    }).populate({
      path: "userId",
      populate: { path: "role", select: "name status" }
    });

    if (!customerProfile || !customerProfile.userId) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      data: formatCustomer(customerProfile),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new customer (User + CustomerProfile)
// @route   POST /api/v1/customers/post
// @access  Public
exports.createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      number,
      role: roleId,
      status,
      address,
    } = req.body;

    // Validation
    if (!name || !email || !number || !roleId) {
      return res.status(400).json({ success: false, message: "Please provide all required customer details" });
    }

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Verify role exists
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) {
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

    // Create Customer Profile
    const profile = await CustomerProfile.create({
      userId: user._id,
      address: address || "",
    });

    const populatedUser = await User.findById(user._id).populate("role", "name status");

    res.status(201).json({
      success: true,
      data: formatCustomer({ userId: populatedUser, ...profile.toObject() }),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update customer member details
// @route   POST /api/v1/customers/put
// @access  Public
exports.updateCustomer = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const {
      name,
      email,
      number,
      status,
      address,
      loyaltyPoints,
    } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a user or profile ID" });
    }

    // Find customer profile first
    let customerProfile = await CustomerProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    });

    if (!customerProfile) {
      return res.status(404).json({ success: false, message: "Customer profile not found" });
    }

    // Find and update User
    const user = await User.findById(customerProfile.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Associated customer user account not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.number = number || user.number;
    user.status = status !== undefined ? status : user.status;
    await user.save();

    // Update Customer Profile fields
    if (address !== undefined) customerProfile.address = address;
    if (loyaltyPoints !== undefined) customerProfile.loyaltyPoints = loyaltyPoints;
    await customerProfile.save();

    const populatedUser = await User.findById(user._id).populate("role", "name status");

    res.status(200).json({
      success: true,
      data: formatCustomer({ userId: populatedUser, ...customerProfile.toObject() }),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete customer member
// @route   POST /api/v1/customers/delete
// @access  Public
exports.deleteCustomer = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide an ID" });
    }

    const customerProfile = await CustomerProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    });

    if (!customerProfile) {
      return res.status(404).json({ success: false, message: "Customer profile not found" });
    }

    // 1. Delete CustomerProfile document
    await CustomerProfile.findByIdAndDelete(customerProfile._id);

    // 2. Delete Core User document
    await User.findByIdAndDelete(customerProfile.userId);

    res.status(200).json({
      success: true,
      message: "Customer account and profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
