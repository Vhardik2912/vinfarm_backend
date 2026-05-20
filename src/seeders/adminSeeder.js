const Role = require("../models/Role");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // 1. Find "admin" role (which should be created by roleSeeder)
    const adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      console.error("❌ Admin role not found. Please run roleSeeder first.");
      return;
    }

    // 2. Read manual credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL || "admin@resort.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // 3. Ensure master Admin user exists
    let adminUser = await User.findOne({ email: adminEmail }).select("+password");

    if (!adminUser) {
      // Create core User with password directly
      adminUser = await User.create({
        name: "System Admin",
        email: adminEmail,
        number: "1234567890",
        password: adminPassword,
        roleId: adminRole._id,
        isActive: true,
      });

      console.log("\n=======================================================");
      console.log("🎉 MASTER ADMIN BOOTSTRAP SUCCESSFUL!");
      console.log(`📧 Email   : ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log("=======================================================\n");
    } else {
      // Update credentials if changed/booting
      adminUser.email = adminEmail;
      if (process.env.ADMIN_PASSWORD) {
        adminUser.password = adminPassword;
      }
      await adminUser.save();
    }
  } catch (error) {
    console.error("❌ Admin Seeder Error:", error.message);
  }
};

module.exports = seedAdmin;
