const BOOKING_STATUS = Object.freeze({
  AVAILABLE: "Available",
  BOOKED: "Booked",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
});

const CLEANING_STATUS = Object.freeze({
  CLEAN: "Clean",
  DIRTY: "Dirty",
  CLEANING: "Cleaning",
});

const ROOM_TYPES = Object.freeze(["Family", "Bachelor", "Tent", "VIP Room"]);

module.exports = {
  BOOKING_STATUS,
  CLEANING_STATUS,
  ROOM_TYPES,
};
