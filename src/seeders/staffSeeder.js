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
          number: "9876543210",
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
          number: "9876543211",
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
  } catch (error) {
    console.error("❌ Staff Seeder Error:", error.message);
  }
};

module.exports = seedStaff;
