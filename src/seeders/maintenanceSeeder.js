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
        propertyId: propertyVinfram ? propertyVinfram._id : null,
        issueType: "Electrical Issue",
        description: "Scheduled checkup of main generator and wiring.",
        priority: "Medium",
        status: "Pending",
        cost: 1500,
        isScheduled: true,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      }
    ];

    for (const recordData of defaultRecords) {
      let record = await Maintenance.findOne({
        reportedBy: recordData.reportedBy,
        issueType: recordData.issueType,
        description: recordData.description,
      });

      if (!record) {
        await Maintenance.create(recordData);
        console.log(`🔧 Maintenance record for '${recordData.issueType}' created successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Maintenance Seeder Error:", error.message);
  }
};

module.exports = seedMaintenance;
