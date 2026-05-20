const Vehicle = require("../models/Vehicle");

const seedVehicles = async () => {
  try {
    const defaultVehicles = [
      {
        make: "Toyota",
        model: "Fortuner",
        licensePlate: "MH-12-AB-1234",
        type: "SUV",
        capacity: 7,
        pricePerDay: 3500,
        priceAirportTrip: 1200,
        status: "Available",
        isActive: true,
      },
      {
        make: "Mercedes-Benz",
        model: "E-Class",
        licensePlate: "MH-12-CD-5678",
        type: "Luxury Car",
        capacity: 4,
        pricePerDay: 8000,
        priceAirportTrip: 3000,
        status: "Available",
        isActive: true,
      },
      {
        make: "Force",
        model: "Traveler",
        licensePlate: "MH-12-EF-9012",
        type: "Mini Bus",
        capacity: 15,
        pricePerDay: 6000,
        priceAirportTrip: 2500,
        status: "Available",
        isActive: true,
      },
      {
        make: "Mahindra",
        model: "Scorpio Getaway",
        licensePlate: "MH-12-GH-3456",
        type: "Pickup Vehicle",
        capacity: 5,
        pricePerDay: 3000,
        priceAirportTrip: 1000,
        status: "Available",
        isActive: true,
      },
    ];

    for (const vehicleData of defaultVehicles) {
      let vehicle = await Vehicle.findOne({ licensePlate: vehicleData.licensePlate });
      if (!vehicle) {
        await Vehicle.create(vehicleData);
        console.log(`🚗 Vehicle '${vehicleData.make} ${vehicleData.model}' (${vehicleData.licensePlate}) seeded successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Vehicle Seeder Error:", error.message);
  }
};

module.exports = seedVehicles;
