const FoodOrder = require("../models/FoodOrder");
const Restaurant = require("../models/Restaurant");
const RestaurantMenu = require("../models/RestaurantMenu");
const User = require("../models/User");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { getPagination } = require("../utils/paginationHelper");
const { FOOD_ORDER_STATUS, PAYMENT_STATUS } = require("../constants/constants");

// @desc    Get all food orders
// @route   GET /api/food-order/get
// @access  Private
exports.getFoodOrders = catchAsync("getFoodOrders", async (req, res, next) => {
  const { customerId, restaurantId, orderStatus, paymentStatus } = req.query;
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  if (customerId) filter.customerId = customerId;
  if (restaurantId) filter.restaurantId = restaurantId;
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const total = await FoodOrder.countDocuments(filter);
  const orders = await FoodOrder.find(filter)
    .populate("customerId", "name email phone")
    .populate("restaurantId", "name cuisineType")
    .populate("items.menuId", "name price isVeg image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse({ res, data: orders, other: buildMeta(total) });
});

// @desc    Get single food order by ID
// @route   GET /api/food-order/getid/:id
// @access  Private
exports.getFoodOrder = catchAsync("getFoodOrder", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) throw new AppError("Please provide a food order ID", 400);

  const order = await FoodOrder.findOne({ _id: id, isDeleted: false })
    .populate("customerId", "name email phone")
    .populate("restaurantId", "name cuisineType")
    .populate("items.menuId", "name price isVeg image");

  if (!order) throw new AppError("Food order not found", 404);

  successResponse({ res, data: order });
});

// @desc    Create new food order
// @route   POST /api/food-order/post
// @access  Private
exports.createFoodOrder = catchAsync("createFoodOrder", async (req, res, next) => {
  const { customerId, restaurantId, items, orderStatus, paymentStatus, specialRequest, isActive } = req.body;

  if (!customerId || !restaurantId || !items || items.length === 0) {
    throw new AppError("Please provide all required food order details", 400);
  }

  // 1. Verify customer exists
  const customerExists = await User.findById(customerId);
  if (!customerExists) {
    throw new AppError("Selected customer not found", 404);
  }

  // 2. Verify restaurant exists
  const restaurantExists = await Restaurant.findOne({ _id: restaurantId, isDeleted: false });
  if (!restaurantExists) {
    throw new AppError("Selected restaurant not found", 404);
  }

  // 3. Populate and snapshot prices of items from DB to prevent client-side price tampering
  const snapshottedItems = [];
  for (const item of items) {
    const menuItem = await RestaurantMenu.findOne({ _id: item.menuId, restaurantId, isDeleted: false });
    if (!menuItem) {
      throw new AppError(`Menu item ${item.menuId} not found or doesn't belong to this restaurant`, 404);
    }
    
    snapshottedItems.push({
      menuId: item.menuId,
      price: menuItem.price, // Use actual current menu item price from database!
      quantity: item.quantity,
      notes: item.notes || "",
    });
  }

  const order = await FoodOrder.create({
    customerId,
    restaurantId,
    items: snapshottedItems,
    orderStatus: orderStatus || FOOD_ORDER_STATUS.PENDING,
    paymentStatus: paymentStatus || PAYMENT_STATUS.PENDING,
    specialRequest: specialRequest || "",
    isActive: isActive !== undefined ? isActive : true,
  });

  const populatedOrder = await FoodOrder.findById(order._id)
    .populate("customerId", "name email phone")
    .populate("restaurantId", "name cuisineType")
    .populate("items.menuId", "name price isVeg image");

  successResponse({
    res,
    statusCode: 201,
    message: "Food order placed successfully",
    data: populatedOrder,
  });
});

// @desc    Update food order details
// @route   PUT /api/food-order/put/:id
// @access  Private
exports.updateFoodOrder = catchAsync("updateFoodOrder", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) throw new AppError("Please provide a food order ID", 400);

  const order = await FoodOrder.findOne({ _id: id, isDeleted: false });
  if (!order) throw new AppError("Food order not found", 404);

  const { customerId, restaurantId, items, orderStatus, paymentStatus, specialRequest, isActive } = req.body;

  // Verify customer exists if updating
  if (customerId) {
    const customerExists = await User.findById(customerId);
    if (!customerExists) throw new AppError("Selected customer not found", 404);
    order.customerId = customerId;
  }

  // Verify restaurant exists if updating
  if (restaurantId) {
    const restaurantExists = await Restaurant.findOne({ _id: restaurantId, isDeleted: false });
    if (!restaurantExists) throw new AppError("Selected restaurant not found", 404);
    order.restaurantId = restaurantId;
  }

  // Re-snapshot items if updating
  if (items && items.length > 0) {
    const targetRestaurantId = restaurantId || order.restaurantId;
    const snapshottedItems = [];
    for (const item of items) {
      const menuItem = await RestaurantMenu.findOne({ _id: item.menuId, restaurantId: targetRestaurantId, isDeleted: false });
      if (!menuItem) {
        throw new AppError(`Menu item ${item.menuId} not found or doesn't belong to this restaurant`, 404);
      }
      
      snapshottedItems.push({
        menuId: item.menuId,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes || "",
      });
    }
    order.items = snapshottedItems;
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (specialRequest !== undefined) order.specialRequest = specialRequest;
  if (isActive !== undefined) order.isActive = isActive;

  await order.save();

  const populatedOrder = await FoodOrder.findById(order._id)
    .populate("customerId", "name email phone")
    .populate("restaurantId", "name cuisineType")
    .populate("items.menuId", "name price isVeg image");

  successResponse({
    res,
    message: "Food order updated successfully",
    data: populatedOrder,
  });
});

// @desc    Update order status
// @route   PUT /api/food-order/status/:id
// @access  Private
exports.updateOrderStatus = catchAsync("updateOrderStatus", async (req, res, next) => {
  const id = req.params.id;
  const { orderStatus } = req.body;

  if (!orderStatus || !Object.values(FOOD_ORDER_STATUS).includes(orderStatus)) {
    throw new AppError("Please provide a valid order status", 400);
  }

  const order = await FoodOrder.findOne({ _id: id, isDeleted: false });
  if (!order) throw new AppError("Food order not found", 404);

  order.orderStatus = orderStatus;
  await order.save();

  const populatedOrder = await FoodOrder.findById(order._id)
    .populate("customerId", "name email phone")
    .populate("restaurantId", "name cuisineType")
    .populate("items.menuId", "name price isVeg image");

  successResponse({
    res,
    message: `Order status updated to ${orderStatus} successfully`,
    data: populatedOrder,
  });
});

// @desc    Update payment status
// @route   PUT /api/food-order/payment/:id
// @access  Private
exports.updatePaymentStatus = catchAsync("updatePaymentStatus", async (req, res, next) => {
  const id = req.params.id;
  const { paymentStatus } = req.body;

  if (!paymentStatus || !Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    throw new AppError("Please provide a valid payment status", 400);
  }

  const order = await FoodOrder.findOne({ _id: id, isDeleted: false });
  if (!order) throw new AppError("Food order not found", 404);

  order.paymentStatus = paymentStatus;
  await order.save();

  const populatedOrder = await FoodOrder.findById(order._id)
    .populate("customerId", "name email phone")
    .populate("restaurantId", "name cuisineType")
    .populate("items.menuId", "name price isVeg image");

  successResponse({
    res,
    message: `Payment status updated to ${paymentStatus} successfully`,
    data: populatedOrder,
  });
});

// @desc    Soft delete food order
// @route   DELETE /api/food-order/delete/:id
// @access  Private
exports.deleteFoodOrder = catchAsync("deleteFoodOrder", async (req, res, next) => {
  const id = req.params.id;

  const order = await FoodOrder.findOne({ _id: id, isDeleted: false });
  if (!order) throw new AppError("Food order not found", 404);

  order.isDeleted = true;
  order.isActive = false;
  await order.save();

  successResponse({
    res,
    message: "Food order deleted successfully (soft deleted)",
  });
});
