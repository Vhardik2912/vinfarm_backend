const MESSAGES = Object.freeze({
  SUCCESS: {
    REGISTERED: "Registered successfully",
    LOGGED_IN: "Logged in successfully",
    CREATED: "Created successfully",
    UPDATED: "Updated successfully",
    DELETED: "Deleted successfully",
    FETCHED: "Fetched successfully",
  },
  ERROR: {
    REQUIRED_FIELDS: "Please provide all required fields",
    EMAIL_EXISTS: "Email is already registered",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Invalid credentials or unauthorized access",
    DEACTIVATED: "Your account has been deactivated.",
    SERVER_ERROR: "Something went wrong on the server",
  }
});

const VALIDATION_MESSAGES = Object.freeze({
  ROOM: {
    NUMBER_REQUIRED: "Please add a room number or ID",
    TYPE_REQUIRED: "Please specify a room type",
    PRICE_REQUIRED: "Please add a base price",
    BOOKING_STATUS_REQUIRED: "Please add booking status",
    CLEANING_STATUS_REQUIRED: "Please add cleaning status",
    PROPERTY_REQUIRED: "Please specify a property for this room",
  },
  USER: {
    NAME_REQUIRED: "Please add a name",
    EMAIL_REQUIRED: "Please add an email",
    EMAIL_VALID: "Please add a valid email",
    NUMBER_REQUIRED: "Please add a phone number",
    ROLE_REQUIRED: "Please select a role",
    COUNTRY_REQUIRED: "Please specify country name",
  },
  STAFF: {
    EMAIL_REQUIRED: "Please add an email for Staff profile",
    EMAIL_VALID: "Please add a valid email",
    JOIN_DATE_REQUIRED: "Please add a join date",
    SALARY_REQUIRED: "Please add salary information",
    ID_PROOF_REQUIRED: "Please upload an ID proof document",
  },
  ROLE: {
    NAME_REQUIRED: "Role name is required",
  },
  DESIGNATION: {
    NAME_REQUIRED: "Designation name is required",
  },
  PROPERTY: {
    NAME_REQUIRED: "Please add a property name",
    TYPE_REQUIRED: "Please specify a property type",
  },
  VEHICLE: {
    MAKE_REQUIRED: "Please specify vehicle make/brand",
    MODEL_REQUIRED: "Please specify vehicle model",
    PLATE_REQUIRED: "Please add vehicle license plate number",
    TYPE_REQUIRED: "Please specify a valid vehicle type",
  },
  DRIVER: {
    NAME_REQUIRED: "Please specify driver name",
    PHONE_REQUIRED: "Please specify driver phone number",
    LICENSE_REQUIRED: "Please specify driver license number",
    COUNTRY_REQUIRED: "Please specify driver country name",
  },
  TRANSPORT_BOOKING: {
    CUSTOMER_REQUIRED: "Please specify a customer ID",
    VEHICLE_REQUIRED: "Please specify a vehicle ID",
    TYPE_REQUIRED: "Please specify booking type",
    PICKUP_TIME_REQUIRED: "Please specify pickup date and time",
  },
  MAINTENANCE: {
    ISSUE_TYPE_REQUIRED: "Please specify issue type",
    DESCRIPTION_REQUIRED: "Please provide a description of the issue",
    REPORTER_REQUIRED: "Please specify the user reporting the issue",
  },
  BOOKING: {
    CUSTOMER_REQUIRED: "Customer ID is required",
    ROOM_REQUIRED: "Room ID is required",
    ROOM_NUMBER_REQUIRED: "Room number is required",
    ROOM_TYPE_REQUIRED: "Room type is required",
    GUESTS_REQUIRED: "Number of guests is required",
    CHECKIN_REQUIRED: "Check-in date is required",
    CHECKOUT_REQUIRED: "Check-out date is required",
    BASE_AMOUNT_REQUIRED: "Base amount is required",
    TOTAL_AMOUNT_REQUIRED: "Total amount is required",
  },
  FARM_BOOKING: {
    CUSTOMER_REQUIRED: "Customer ID is required",
    START_DATE_REQUIRED: "Start date and time is required",
    END_DATE_REQUIRED: "End date and time is required",
    GUESTS_REQUIRED: "Number of guests is required",
  }
});

module.exports = {
  MESSAGES,
  VALIDATION_MESSAGES,
};
