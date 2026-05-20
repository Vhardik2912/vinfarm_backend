const Designation = require("../models/Designation");

const seedDesignations = async () => {
  try {
    const defaultDesignations = [
      "Driver",
      "manager",
      "receptionist",
      "housekeeping"
    ];

    for (const title of defaultDesignations) {
      let designation = await Designation.findOne({ name: title });
      if (!designation) {
        await Designation.create({
          name: title,
          status: true,
          isActive: true,
        });
        console.log(`👔 Designation '${title}' created successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Designation Seeder Error:", error.message);
  }
};

module.exports = seedDesignations;
