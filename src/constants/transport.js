const TRANSPORT_BOOKING_TYPE = Object.freeze([
  "Car Rental",
  "Airport Pickup",
  "Airport Drop",
  "Driver Service",
]);

const TRANSPORT_BOOKING_STATUS = Object.freeze({
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
});

module.exports = {
  TRANSPORT_BOOKING_TYPE,
  TRANSPORT_BOOKING_STATUS,
};
