const FARM_EVENT_TYPES = Object.freeze([
  "Staycation",
  "Pool Party",
  "Wedding",
  "Corporate Event",
  "Private Party",
  "Other"
]);

const FARM_BOOKING_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked-in",
  CHECKED_OUT: "checked-out",
  CANCELLED: "cancelled"
});

const FARM_PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded"
});

module.exports = {
  FARM_EVENT_TYPES,
  FARM_BOOKING_STATUS,
  FARM_PAYMENT_STATUS
};
