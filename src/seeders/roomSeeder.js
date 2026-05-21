const Room = require("../models/Room");
const Property = require("../models/Property");

const defaultRooms = [
  {
    roomNumber: "101",
    roomType: "Family",
    basePrice: 2500,
    bookingStatus: "Available",
    cleaningStatus: "Clean",
    isActive: true,
  },
  {
    roomNumber: "102",
    roomType: "Bachelor",
    basePrice: 1500,
    bookingStatus: "Booked",
    cleaningStatus: "Clean",
    isActive: true,
  },
  {
    roomNumber: "201",
    roomType: "VIP Room",
    basePrice: 5000,
    bookingStatus: "Maintenance",
    cleaningStatus: "Dirty",
    isActive: true,
  },
  {
    roomNumber: "202",
    roomType: "Family",
    basePrice: 2500,
    bookingStatus: "Available",
    cleaningStatus: "Cleaning",
    isActive: true,
  },
  {
    roomNumber: "T-01",
    roomType: "Tent",
    basePrice: 1000,
    bookingStatus: "Available",
    cleaningStatus: "Clean",
    isActive: true,
  },
  {
    roomNumber: "V-01",
    roomType: "VIP Room",
    basePrice: 5000,
    bookingStatus: "Reserved",
    cleaningStatus: "Clean",
    isActive: true,
  },
];

const seedRooms = async () => {
  try {
    const defaultProperty = await Property.findOne({ name: "Vinfram Resort" });
    if (!defaultProperty) {
      console.error("❌ Default property not found. Run propertySeeder first.");
      return;
    }

    const roomCount = await Room.countDocuments({ isDeleted: false });
    if (roomCount > 0) {
      return;
    }

    for (const roomData of defaultRooms) {
      await Room.create({
        ...roomData,
        propertyId: defaultProperty._id,
      });
      console.log(`🏨 Room ${roomData.roomNumber} (${roomData.roomType}) seeded successfully.`);
    }
  } catch (error) {
    console.error("❌ Room Seeder Error:", error.message);
  }
};

module.exports = seedRooms;
