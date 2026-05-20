const Driver = require("../models/Driver");

const seedDrivers = async () => {
  try {
    const defaultDrivers = [
      {
        name: "Ramesh Kumar",
        phone: "9876543210",
        licenseNumber: "DL-1420110012345",
        isActive: true,
      },
      {
        name: "Suresh Singh",
        phone: "9876543211",
        licenseNumber: "DL-1420110012346",
        isActive: true,
      },
    ];

    for (const driverData of defaultDrivers) {
      let driver = await Driver.findOne({ licenseNumber: driverData.licenseNumber });
      if (!driver) {
        await Driver.create(driverData);
        console.log(`👨‍✈️ Driver '${driverData.name}' (${driverData.licenseNumber}) seeded successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Driver Seeder Error:", error.message);
  }
};

module.exports = seedDrivers;
