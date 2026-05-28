const ROOM_TYPE = Object.freeze({
  FAMILY_VILLA: "FAMILY_VILLA",
  BACHELOR_SUITE: "BACHELOR_SUITE",
  LUXURY_TENT: "LUXURY_TENT",
  VIP_PALACE_ROOM: "VIP_PALACE_ROOM",
});

const ROOM_BOOKING_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked-in",
  CHECKED_OUT: "checked-out",
  CANCELLED: "cancelled",
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially-refunded",
});

const REFUND_STATUS = Object.freeze({
  NONE: "none",
  REQUESTED: "requested",
  PROCESSED: "processed",
});

const EXTRA_SERVICES = Object.freeze([
  "Airport Transfer",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Laundry",
  "Spa",
  "Room Cleaning",
  "Baby Cot",
  "Extra Bed",
]);

const CUSTOMER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confrom",
  CHECK_IN: "check in",
  OUT: "out",
  CANCELLED: "cancelled",
});

const VEHICLE_BOOKING_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const FOOD_ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PREPARING: "preparing",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

const MAINTENANCE_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
});

const MAINTENANCE_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

module.exports = {
  ROOM_TYPE,
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_STATUS,
  EXTRA_SERVICES,
  CUSTOMER_STATUS,
  VEHICLE_BOOKING_STATUS,
  FOOD_ORDER_STATUS,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
};
