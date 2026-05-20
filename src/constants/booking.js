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

module.exports = {
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_STATUS,
  EXTRA_SERVICES,
};
