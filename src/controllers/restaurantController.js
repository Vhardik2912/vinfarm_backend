const Restaurant = require("../models/Restaurant");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { getPagination } = require("../utils/paginationHelper");

// @desc    Get all restaurants
// @route   GET /api/restaurant/get
// @access  Private
exports.getRestaurants = catchAsync("getRestaurants", async (req, res, next) => {
  const { isVeg, isActive } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (isVeg !== undefined) filter.isVeg = isVeg === "true";
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const total = await Restaurant.countDocuments(filter);
  const restaurants = await Restaurant.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: restaurants, other: buildMeta(total) });
});

// @desc    Get single restaurant by ID
// @route   GET /api/restaurant/getid/:id
// @access  Private
exports.getRestaurant = catchAsync("getRestaurant", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) throw new AppError("Please provide a restaurant ID", 400);

  const restaurant = await Restaurant.findOne({ _id: id, isDeleted: false });

  if (!restaurant) throw new AppError("Restaurant not found", 404);

  successResponse({ res, data: restaurant });
});

// @desc    Create new restaurant
// @route   POST /api/restaurant/post
// @access  Private
exports.createRestaurant = catchAsync("createRestaurant", async (req, res, next) => {
  const { name, description, cuisineType, isVeg, isActive } = req.body;

  if (!name || !description || !cuisineType) {
    throw new AppError("Please provide all required restaurant details", 400);
  }

  const restaurant = await Restaurant.create({
    name,
    description,
    cuisineType,
    isVeg: isVeg !== undefined ? isVeg : false,
    isActive: isActive !== undefined ? isActive : true,
  });

  successResponse({
    res,
    statusCode: 201,
    message: "Restaurant added successfully",
    data: restaurant,
  });
});

// @desc    Update restaurant
// @route   PUT /api/restaurant/put/:id
// @access  Private
exports.updateRestaurant = catchAsync("updateRestaurant", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) throw new AppError("Please provide a restaurant ID", 400);

  const restaurant = await Restaurant.findOne({ _id: id, isDeleted: false });
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const { name, description, cuisineType, isVeg, isActive } = req.body;

  if (name) restaurant.name = name;
  if (description) restaurant.description = description;
  if (cuisineType) restaurant.cuisineType = cuisineType;
  if (isVeg !== undefined) restaurant.isVeg = isVeg;
  if (isActive !== undefined) restaurant.isActive = isActive;

  await restaurant.save();

  successResponse({
    res,
    message: "Restaurant updated successfully",
    data: restaurant,
  });
});

// @desc    Soft delete restaurant
// @route   DELETE /api/restaurant/delete/:id
// @access  Private
exports.deleteRestaurant = catchAsync("deleteRestaurant", async (req, res, next) => {
  const id = req.params.id;

  const restaurant = await Restaurant.findOne({ _id: id, isDeleted: false });
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  restaurant.isDeleted = true;
  restaurant.isActive = false;
  await restaurant.save();

  successResponse({
    res,
    message: "Restaurant deleted successfully (soft deleted)",
  });
});
