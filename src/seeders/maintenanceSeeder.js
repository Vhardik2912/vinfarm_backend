const Maintenance = require("../models/Maintenance");
const User = require("../models/User");
const Room = require("../models/Room");
const Property = require("../models/Property");

const seedMaintenance = async () => {
  try {
    const adminUser = await User.findOne({ email: "admin@resort.com" });
    if (!adminUser) {
      console.error("❌ Admin user not found. Run adminSeeder first.");
      return;
    }

    const room101 = await Room.findOne({ roomNumber: "101" });
    const propertyVinfram = await Property.findOne({ name: "Vinfram Resort" });

    const count = await Maintenance.countDocuments({ isDeleted: false });
    if (count > 0) return;

    const defaultRecords = [
      {
        reportedBy: adminUser._id,
        roomId: room101 ? room101._id : null,
        propertyId: propertyVinfram ? propertyVinfram._id : null,
        issueType: "AC Issue",
        description: "AC is leaking water and not cooling properly.",
        priority: "High",
        status: "Pending",
        cost: 0,
        isScheduled: false,
      },
      {
        reportedBy: adminUser._id,
        roomId: room101 ? room101._id : null,
        propertyId: propertyVinfram ? propertyVinfram._id : null,
        issueType: "Water Leakage",
        description: "Bathroom pipe leak in room 101.",
        priority: "Critical",
        status: "In Progress",
        cost: 500,
        isScheduled: false,
      },
      {
        reportedBy: adminUser._id,
        propertyId: propertyVinfram ? propertyVinfram._id : null,
        issueType: "Electrical Issue",
        description: "Generator wiring inspection completed.",
        priority: "Medium",
        status: "Resolved",
        cost: 1500,
        isScheduled: true,
        scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    for (const recordData of defaultRecords) {
      await Maintenance.create(recordData);
      console.log(`🔧 Maintenance record for '${recordData.issueType}' created successfully.`);
    }
  } catch (error) {
    console.error("❌ Maintenance Seeder Error:", error.message);
  }
};

module.exports = seedMaintenance;
