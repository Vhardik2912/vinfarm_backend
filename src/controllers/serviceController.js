const Service = require("../models/Service");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

// @desc    Get all services
// @route   GET /api/service/get
// @access  Private
exports.getServices = catchAsync("getServices", async (req, res, next) => {
  const services = await Service.find({ isDeleted: false });
  
  successResponse({
    res,
    data: services,
  });
});

// @desc    Get single service
// @route   POST /api/service/getid or GET /api/service/getid/:id
// @access  Private
exports.getService = catchAsync("getService", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide a service ID", 400);
  }

  const service = await Service.findById(id);
  if (!service || service.isDeleted) {
    throw new AppError("Service not found", 404);
  }

  successResponse({
    res,
    data: service,
  });
});

// @desc    Create new service
// @route   POST /api/service/post
// @access  Private
exports.createService = catchAsync("createService", async (req, res, next) => {
  const { name, isActive } = req.body;

  if (!name) {
    throw new AppError("Please provide a service name", 400);
  }

  const serviceExists = await Service.findOne({ name });
  if (serviceExists) {
    throw new AppError("Service already exists", 400);
  }

  const service = await Service.create({
    name,
    isActive: isActive !== undefined ? isActive : true,
  });

  successResponse({
    res,
    statusCode: 201,
    message: "Service created successfully",
    data: service,
  });
});

// @desc    Update service details
// @route   POST /api/service/put or PUT /api/service/put/:id
// @access  Private
exports.updateService = catchAsync("updateService", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a service ID", 400);
  }

  const service = await Service.findById(id);
  if (!service || service.isDeleted) {
    throw new AppError("Service not found", 404);
  }

  const { name, isActive } = req.body;

  if (name !== undefined) {
    if (name !== service.name) {
      const serviceExists = await Service.findOne({ name });
      if (serviceExists) {
        throw new AppError("Service name already exists", 400);
      }
    }
    service.name = name;
  }

  if (isActive !== undefined) {
    service.isActive = isActive;
  }

  await service.save();

  successResponse({
    res,
    message: "Service updated successfully",
    data: service,
  });
});

// @desc    Delete service
// @route   POST /api/service/delete or DELETE /api/service/delete/:id
// @access  Private
exports.deleteService = catchAsync("deleteService", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide a service ID", 400);
  }

  const service = await Service.findById(id);
  if (!service || service.isDeleted) {
    throw new AppError("Service not found", 404);
  }

  service.isDeleted = true;
  service.isActive = false;
  await service.save();

  successResponse({
    res,
    message: "Service deleted successfully",
  });
});
