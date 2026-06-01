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
    PROPERTY_REQUIRED: "Please specify a property for this room",
  },
  USER: {
    NAME_REQUIRED: "Please add a name",
    EMAIL_REQUIRED: "Please add an email",
    EMAIL_VALID: "Please add a valid email",
    PHONE_REQUIRED: "Please add a phone number",
    ROLE_REQUIRED: "Please select a role",
    COUNTRY_CODE_REQUIRED: "Please specify country code",
  },
  STAFF: {
    JOIN_DATE_REQUIRED: "Please add a join date",
    SALARY_REQUIRED: "Please add salary information",
    ID_PROOF_REQUIRED: "Please upload an ID proof document",
  },
  ROLE: {
    NAME_REQUIRED: "Role name is required",
  },
  SERVICE: {
    NAME_REQUIRED: "Service name is required",
  },
  DESIGNATION: {
    NAME_REQUIRED: "Designation name is required",
  },
  PROPERTY: {
    NAME_REQUIRED: "Please add a property name",
    TYPE_REQUIRED: "Please specify a property type",
  },
  VEHICLE: {
    NAME_REQUIRED: "Vehicle name is required",
    TYPE_REQUIRED: "Vehicle type is required",
    NUMBER_REQUIRED: "Vehicle number is required",
    CAPACITY_REQUIRED: "Vehicle capacity is required",
    PROPERTY_REQUIRED: "Property ID is required",
  },
  BOOKING: {
    CUSTOMER_REQUIRED: "Customer ID is required",
    ROOM_REQUIRED: "Room ID is required",
    GUESTS_REQUIRED: "Number of guests is required",
    CHECKIN_REQUIRED: "Check-in date is required",
    CHECKOUT_REQUIRED: "Check-out date is required",
    BASE_AMOUNT_REQUIRED: "Base amount is required",
    TOTAL_AMOUNT_REQUIRED: "Total amount is required",
  },
  CUSTOMER: {
    DOCUMENT_REQUIRED: "Document (ID proof) upload is required",
    STATUS_REQUIRED: "Status is required",
  },
  VEHICLE_BOOKING: {
    VEHICLE_REQUIRED:  "Vehicle ID is required",
    PROPERTY_REQUIRED: "Property ID is required",
    CUSTOMER_REQUIRED: "Customer ID is required",
    CREATED_BY_REQUIRED: "Created by user ID is required",
    PICKUP_POINT_REQUIRED: "Pickup point is required",
    DROP_POINT_REQUIRED:   "Drop point is required",
    PICKUP_TIME_REQUIRED:  "Pickup time is required",
    PRICE_REQUIRED:        "Price is required",
  },
  VEHICLE_MAINTENANCE: {
    VEHICLE_REQUIRED: "Vehicle ID is required",
    CREATED_BY_REQUIRED: "Created by user ID is required",
    TITLE_REQUIRED: "Title is required",
    DESCRIPTION_REQUIRED: "Description is required",
    AMOUNT_REQUIRED: "Amount is required",
  },
  RESTAURANT: {
    NAME_REQUIRED: "Restaurant name is required",
    CUISINE_REQUIRED: "Cuisine type is required",
    DESCRIPTION_REQUIRED: "Description is required",
  },
  RESTAURANT_MENU: {
    RESTAURANT_REQUIRED: "Restaurant ID is required",
    NAME_REQUIRED: "Item name is required",
    PRICE_REQUIRED: "Price is required",
    DESCRIPTION_REQUIRED: "Description is required",
  },
  FOOD_ORDER: {
    CUSTOMER_REQUIRED: "Customer ID is required",
    RESTAURANT_REQUIRED: "Restaurant ID is required",
    ITEMS_REQUIRED: "Order items are required",
    ITEM_MENU_REQUIRED: "Menu item ID is required",
    ITEM_PRICE_REQUIRED: "Menu item price is required",
    ITEM_QUANTITY_REQUIRED: "Menu item quantity is required",
  },
  MAINTENANCE: {
    ROOM_REQUIRED: "Room ID is required",
    REPORTED_BY_REQUIRED: "Reported by user ID is required",
    ISSUE_TYPE_REQUIRED: "Issue type is required",
    DESCRIPTION_REQUIRED: "Description is required",
  },
  HOUSEKEEPING: {
    ROOM_REQUIRED: "Room ID is required",
    TASK_TYPE_REQUIRED: "Task type is required",
    SCHEDULED_DATE_REQUIRED: "Scheduled date is required",
    ASSIGNED_BY_REQUIRED: "Assigned by user ID is required",
  },
});

module.exports = {
  MESSAGES,
  VALIDATION_MESSAGES,
};
