const { loginSchema, registerCustomerSchema } = require("./authValidation");
const { createRoomSchema, updateRoomSchema } = require("./roomValidation");
const { createUserSchema, updateUserSchema } = require("./userValidation");
const { createStaffSchema, updateStaffSchema } = require("./staffValidation");
const {
  createVehicleSchema,
  updateVehicleSchema,
  createFuelLogSchema,
} = require("./vehicleValidation");

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
  createTransportBookingSchema,
  updateTransportBookingSchema,
  createFuelLogSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
