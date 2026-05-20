const { loginSchema, registerCustomerSchema } = require("./authValidation");
const { createRoomSchema, updateRoomSchema } = require("./roomValidation");
const { createUserSchema, updateUserSchema } = require("./userValidation");
const { createStaffSchema, updateStaffSchema } = require("./staffValidation");
const {
  createVehicleSchema,
  updateVehicleSchema,
  createFuelLogSchema,
} = require("./vehicleValidation");
const { createDriverSchema, updateDriverSchema } = require("./driverValidation");
const {
  createTransportBookingSchema,
  updateTransportBookingSchema,
} = require("./transportBookingValidation");
const {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} = require("./maintenanceValidation");

module.exports = {
  loginSchema,
  registerCustomerSchema,
  createRoomSchema,
  updateRoomSchema,
  createUserSchema,
  updateUserSchema,
  createStaffSchema,
  updateStaffSchema,
  createVehicleSchema,
  updateVehicleSchema,
  createDriverSchema,
  updateDriverSchema,
  createTransportBookingSchema,
  updateTransportBookingSchema,
  createFuelLogSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
