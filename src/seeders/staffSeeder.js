const Role = require("../models/Role");
const Designation = require("../models/Designation");
const User = require("../models/User");
const StaffProfile = require("../models/StaffProfile");

const seedStaff = async () => {
  try {
    const staffRole = await Role.findOne({ name: "staff" });
    if (!staffRole) {
      console.log("❌ Staff role not found. Skipping staff seeding.");
      return;
    }

    // Seed a default Manager
    const managerDesignation = await Designation.findOne({ name: "manager" });
    if (managerDesignation) {
      const managerEmail = "manager@resort.com";
      let managerUser = await User.findOne({ email: managerEmail });
      if (!managerUser) {
        managerUser = await User.create({
          name: "Default Manager",
          email: managerEmail,
          phone: "9876543210",
          password: "manager123",
          roleId: staffRole._id,
          isActive: true,
        });

        await StaffProfile.create({
          userId: managerUser._id,
          roleId: staffRole._id,
          designationId: managerDesignation._id,
          email: managerEmail,
          joindate: new Date(),
          salary: 50000,
          idProof: "/uploads/manager_id.pdf",
        });
        console.log("👤 Default Manager seeded successfully.");
      }
    }

    // Seed a default Receptionist
    const receptionistDesignation = await Designation.findOne({ name: "receptionist" });
    if (receptionistDesignation) {
      const receptionistEmail = "receptionist@resort.com";
      let receptionistUser = await User.findOne({ email: receptionistEmail });
      if (!receptionistUser) {
        receptionistUser = await User.create({
          name: "Default Receptionist",
          email: receptionistEmail,
          phone: "9876543211",
          password: "receptionist123",
          roleId: staffRole._id,
          isActive: true,
        });

        await StaffProfile.create({
          userId: receptionistUser._id,
          roleId: staffRole._id,
          designationId: receptionistDesignation._id,
          email: receptionistEmail,
          joindate: new Date(),
          salary: 30000,
          idProof: "/uploads/receptionist_id.pdf",
        });
        console.log("👤 Default Receptionist seeded successfully.");
      }
    }

    // Seed a default Driver
    const driverDesignation = await Designation.findOne({ name: "Driver" });
    if (driverDesignation) {
      const driverEmail = "driver@resort.com";
      let driverUser = await User.findOne({ email: driverEmail });
      if (!driverUser) {
        driverUser = await User.create({
          name: "Default Driver",
          email: driverEmail,
          phone: "9876543212",
          password: "driver123",
          roleId: staffRole._id,
          isActive: true,
        });

        await StaffProfile.create({
          userId: driverUser._id,
          roleId: staffRole._id,
          designationId: driverDesignation._id,
          email: driverEmail,
          joindate: new Date(),
          salary: 25000,
          idProof: "/uploads/driver_id.pdf",
        });
        console.log("👤 Default Driver seeded successfully.");
      }
    }

    // Seed a default Housekeeping Staff
    const housekeepingDesignation = await Designation.findOne({ name: "housekeeping" });
    if (housekeepingDesignation) {
      const housekeepingEmail = "housekeeping@resort.com";
      let housekeepingUser = await User.findOne({ email: housekeepingEmail });
      if (!housekeepingUser) {
        housekeepingUser = await User.create({
          name: "Default Housekeeping Staff",
          email: housekeepingEmail,
          phone: "9876543213",
          password: "housekeeping123",
          roleId: staffRole._id,
          isActive: true,
        });

        await StaffProfile.create({
          userId: housekeepingUser._id,
          roleId: staffRole._id,
          designationId: housekeepingDesignation._id,
          email: housekeepingEmail,
          joindate: new Date(),
          salary: 20000,
          idProof: "/uploads/housekeeping_id.pdf",
        });
        console.log("👤 Default Housekeeping Staff seeded successfully.");
      }
    }

    // Seed a default Maintenance Staff
    const maintenanceDesignation = await Designation.findOne({ name: "maintenance" });
    if (maintenanceDesignation) {
      const maintenanceEmail = "maintenance@resort.com";
      let maintenanceUser = await User.findOne({ email: maintenanceEmail });
      if (!maintenanceUser) {
        maintenanceUser = await User.create({
          name: "Default Maintenance Staff",
          email: maintenanceEmail,
          phone: "9876543214",
          password: "maintenance123",
          roleId: staffRole._id,
          isActive: true,
        });

        await StaffProfile.create({
          userId: maintenanceUser._id,
          roleId: staffRole._id,
          designationId: maintenanceDesignation._id,
          email: maintenanceEmail,
          joindate: new Date(),
          salary: 28000,
          idProof: "/uploads/maintenance_id.pdf",
        });
        console.log("👤 Default Maintenance Staff seeded successfully.");
      }
    }

    // Seed a default Restaurant Staff
    const restaurantDesignation = await Designation.findOne({ name: "restaurant" });
    if (restaurantDesignation) {
      const restaurantEmail = "restaurant@resort.com";
      let restaurantUser = await User.findOne({ email: restaurantEmail });
      if (!restaurantUser) {
        restaurantUser = await User.create({
          name: "Default Restaurant Manager",
          email: restaurantEmail,
          phone: "9876543215",
          password: "restaurant123",
          roleId: staffRole._id,
          isActive: true,
        });

        await StaffProfile.create({
          userId: restaurantUser._id,
          roleId: staffRole._id,
          designationId: restaurantDesignation._id,
          email: restaurantEmail,
          joindate: new Date(),
          salary: 35000,
          idProof: "/uploads/restaurant_id.pdf",
        });
        console.log("👤 Default Restaurant Manager seeded successfully.");
      }
    }
  } catch (error) {
    console.error("❌ Staff Seeder Error:", error.message);
  }
};

module.exports = seedStaff;
