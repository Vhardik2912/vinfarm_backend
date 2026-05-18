const Role = require("../models/Role");
const User = require("../models/User");
const StaffProfile = require("../models/StaffProfile");

const runSeeders = async () => {
  try {
    console.log("🚀 Running system bootstrapper...");

    // 1. Ensure "admin" role exists (required to link admin user)
    let adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "admin",
        status: true,
      });
      console.log("🔑 Master 'admin' role created successfully.");
    }

    // 2. Read manual credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL || "admin@resort.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // 3. Ensure master Admin user exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // Create core User
      adminUser = await User.create({
        name: "System Admin",
        email: adminEmail,
        number: "1234567890",
        role: adminRole._id,
        status: true,
      });

      // Create linked StaffProfile with password
      await StaffProfile.create({
        userId: adminUser._id,
        password: adminPassword, // Will be automatically encrypted
        joindate: new Date(),
        salary: 0,
        idProof: "/uploads/admin_id.pdf", // Dummy path
      });

      console.log("\n=======================================================");
      console.log("🎉 MASTER ADMIN BOOTSTRAP SUCCESSFUL!");
      console.log(`📧 Email   : ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log("=======================================================\n");
    } else {
      // Update password if changed in .env
      const staffProfile = await StaffProfile.findOne({ userId: adminUser._id });
      if (staffProfile && process.env.ADMIN_PASSWORD) {
        staffProfile.password = adminPassword;
        await staffProfile.save();
      }
    }
    console.log("✅ System bootstrapper finished.");
  } catch (error) {
    console.error("❌ Bootstrapper encountered an error:", error.message);
  }
};

module.exports = runSeeders;
