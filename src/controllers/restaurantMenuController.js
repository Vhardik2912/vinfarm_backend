const RestaurantMenu = require("../models/RestaurantMenu");
const Restaurant = require("../models/Restaurant");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");
const { getPagination } = require("../utils/paginationHelper");

// Helper function to delete file safely
const safeDeleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// @desc    Get all restaurant menu items
// @route   GET /api/restaurant-menu/get
// @access  Private
exports.getRestaurantMenus = catchAsync("getRestaurantMenus", async (req, res, next) => {
  const { restaurantId, isVeg, isActive } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (restaurantId) filter.restaurantId = restaurantId;
  if (isVeg !== undefined) filter.isVeg = isVeg === "true";
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const total = await RestaurantMenu.countDocuments(filter);
  const menus = await RestaurantMenu.find(filter)
    .populate({
      path: "restaurantId",
      select: "name cuisineType propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: menus, other: buildMeta(total) });
});

// @desc    Get single restaurant menu item by ID
// @route   GET /api/restaurant-menu/getid/:id
// @access  Private
exports.getRestaurantMenu = catchAsync("getRestaurantMenu", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) throw new AppError("Please provide a menu item ID", 400);

  const menu = await RestaurantMenu.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "restaurantId",
      select: "name cuisineType propertyId",
      populate: {
        path: "propertyId",
        select: "name type location",
      },
    });

  if (!menu) throw new AppError("Menu item not found", 404);

  successResponse({ res, data: menu });
});

// @desc    Create new restaurant menu item
// @route   POST /api/restaurant-menu/post
// @access  Private
exports.createRestaurantMenu = catchAsync("createRestaurantMenu", async (req, res, next) => {
  let uploadedPath = null;
  try {
    const { restaurantId, name, description, price, isVeg, isActive } = req.body;

    if (!restaurantId || !name || !description || price === undefined) {
      throw new AppError("Please provide all required menu item details", 400);
    }

    // Process uploaded file (image) if present
    if (req.file) {
      uploadedPath = `/uploads/${req.file.filename}`;
    }

    // Verify restaurant exists
    const restaurantExists = await Restaurant.findOne({ _id: restaurantId, isDeleted: false });
    if (!restaurantExists) {
      throw new AppError("Selected restaurant not found", 404);
    }

    const menu = await RestaurantMenu.create({
      restaurantId,
      name,
      description,
      price,
      isVeg: isVeg !== undefined ? isVeg : false,
      isActive: isActive !== undefined ? isActive : true,
      image: uploadedPath,
    });

    const populatedMenu = await RestaurantMenu.findById(menu._id)
      .populate({
        path: "restaurantId",
        select: "name cuisineType propertyId",
        populate: {
          path: "propertyId",
          select: "name type location",
        },
      });

    successResponse({
      res,
      statusCode: 201,
      message: "Menu item added successfully",
      data: populatedMenu,
    });
  } catch (error) {
    if (uploadedPath) safeDeleteFile(uploadedPath);
    throw error;
  }
});

// @desc    Update restaurant menu item
// @route   PUT /api/restaurant-menu/put/:id
// @access  Private
exports.updateRestaurantMenu = catchAsync("updateRestaurantMenu", async (req, res, next) => {
  let newUploadedPath = null;
  try {
    const id = req.params.id || req.body.id;
    if (!id) throw new AppError("Please provide a menu item ID", 400);

    const menu = await RestaurantMenu.findOne({ _id: id, isDeleted: false });
    if (!menu) throw new AppError("Menu item not found", 404);

    const { restaurantId, name, description, price, isVeg, isActive, removeImage } = req.body;

    // Verify restaurant exists if restaurantId is being updated
    if (restaurantId) {
      const restaurantExists = await Restaurant.findOne({ _id: restaurantId, isDeleted: false });
      if (!restaurantExists) {
        throw new AppError("Selected restaurant not found", 404);
      }
      menu.restaurantId = restaurantId;
    }

    if (name) menu.name = name;
    if (description) menu.description = description;
    if (price !== undefined) menu.price = price;
    if (isVeg !== undefined) menu.isVeg = isVeg;
    if (isActive !== undefined) menu.isActive = isActive;

    // Handle file upload
    if (req.file) {
      newUploadedPath = `/uploads/${req.file.filename}`;
      // Remove old image file first if it exists
      if (menu.image) {
        safeDeleteFile(menu.image);
      }
      menu.image = newUploadedPath;
    } else if (removeImage === "true" || removeImage === true) {
      if (menu.image) {
        safeDeleteFile(menu.image);
      }
      menu.image = null;
    }

    await menu.save();

    const populatedMenu = await RestaurantMenu.findById(menu._id)
      .populate({
        path: "restaurantId",
        select: "name cuisineType propertyId",
        populate: {
          path: "propertyId",
          select: "name type location",
        },
      });

    successResponse({
      res,
      message: "Menu item updated successfully",
      data: populatedMenu,
    });
  } catch (error) {
    if (newUploadedPath) safeDeleteFile(newUploadedPath);
    throw error;
  }
});

// @desc    Soft delete restaurant menu item
// @route   DELETE /api/restaurant-menu/delete/:id
// @access  Private
exports.deleteRestaurantMenu = catchAsync("deleteRestaurantMenu", async (req, res, next) => {
  const id = req.params.id;

  const menu = await RestaurantMenu.findOne({ _id: id, isDeleted: false });
  if (!menu) throw new AppError("Menu item not found", 404);

  menu.isDeleted = true;
  menu.isActive = false;
  await menu.save();

  successResponse({
    res,
    message: "Menu item deleted successfully (soft deleted)",
  });
});
