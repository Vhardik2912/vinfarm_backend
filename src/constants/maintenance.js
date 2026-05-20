const { Object_freeze = Object.freeze } = {};

const MAINTENANCE_ISSUE_TYPES = Object_freeze([
  "AC Issue",
  "Water Leakage",
  "Electrical Issue",
  "Furniture Damage",
  "Cleaning Issue",
  "Features",
]);

const MAINTENANCE_PRIORITY = Object_freeze(["Low", "Medium", "High", "Critical"]);

const MAINTENANCE_STATUS = Object_freeze({
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
});

module.exports = {
  MAINTENANCE_ISSUE_TYPES,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_STATUS,
};
