const { loginSchema, registerCustomerSchema } = require("./authValidation");
const { createRoomSchema, updateRoomSchema } = require("./roomValidation");
const { createUserSchema, updateUserSchema } = require("./userValidation");
const { createStaffSchema, updateStaffSchema } = require("./staffValidation");
const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("./customerValidation");
const {
  createBookingSchema,
  updateBookingSchema,
} = require("./bookingValidation");
const {
  createServiceSchema,
  updateServiceSchema,
} = require("./serviceValidation");
const {
  createVehicleSchema,
  updateVehicleSchema,
} = require("./vehicleValidation");

module.exports = {
  loginSchema,
  registerCustomerSchema,
  createRoomSchema,
  updateRoomSchema,
  createUserSchema,
  updateUserSchema,
  createStaffSchema,
  updateStaffSchema,
  createCustomerSchema,
  updateCustomerSchema,
  createBookingSchema,
  updateBookingSchema,
  createServiceSchema,
  updateServiceSchema,
  createVehicleSchema,
  updateVehicleSchema,
};
