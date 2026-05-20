const Property = require("../models/Property");

const seedProperties = async () => {
  try {
    const defaultProperties = [
      {
        name: "Vinfram Resort",
        type: "Resort",
        location: "Eco Valley, Hillsdale",
        isActive: true,
      }
    ];

    // Clean up any properties that are not in the default seed list
    await Property.deleteMany({ name: { $ne: "Vinfram Resort" } });

    for (const propertyData of defaultProperties) {
      let property = await Property.findOne({ name: propertyData.name });
      if (!property) {
        await Property.create(propertyData);
        console.log(`🏠 Property '${propertyData.name}' created successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Property Seeder Error:", error.message);
  }
};

module.exports = seedProperties;
