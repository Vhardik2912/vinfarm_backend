const Role = require("../models/Role");

// @desc    Get all roles
// @route   GET /api/v1/roles/get
// @access  Public
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single role
// @route   POST /api/v1/roles/getid or GET /api/v1/roles/getid/:id
// @access  Public
exports.getRole = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a role ID" });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new role
// @route   POST /api/v1/roles/post
// @access  Public
exports.createRole = async (req, res, next) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Please provide a role name" });
    }

    // Check if role name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ success: false, message: "Role name already exists" });
    }

    const role = await Role.create({ name, status });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update role
// @route   POST /api/v1/roles/put
// @access  Public
exports.updateRole = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const { name, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a role ID" });
    }

    let role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    role = await Role.findByIdAndUpdate(
      id,
      { name, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete role
// @route   POST /api/v1/roles/delete
// @access  Public
exports.deleteRole = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Please provide a role ID" });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
