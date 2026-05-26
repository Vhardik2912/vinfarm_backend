const seedRoles = require("./roleSeeder");
const seedDesignations = require("./designationSeeder");
const seedAdmin = require("./adminSeeder");
const seedStaff = require("./staffSeeder");
const seedCustomer = require("./customerSeeder");
const seedProperties = require("./propertySeeder");
const seedRooms = require("./roomSeeder");
const seedBookings = require("./bookingSeeder");

const runSeeders = async () => {
  try {
    console.log("🚀 Running system bootstrapper...");

    // Call individual seeders here sequentially
    await seedRoles();
    await seedDesignations();
    await seedAdmin();
    await seedStaff();
    await seedCustomer();
    await seedProperties();
    await seedRooms();
    await seedBookings();

    console.log("✅ System bootstrapper finished.");
  } catch (error) {
    console.error("❌ Bootstrapper encountered an error:", error.message);
  }
};

module.exports = runSeeders;
