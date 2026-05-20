const Room = require("../models/Room");
const Property = require("../models/Property");

const seedRooms = async () => {
  try {
    const defaultProperty = await Property.findOne({ name: "Vinfram Resort" });
    if (!defaultProperty) {
      console.error("❌ Default property not found. Run propertySeeder first.");
      return;
    }

    const defaultRooms = [
      {
        roomNumber: "101",
        roomType: "Family",
        basePrice: 2500,
        bookingStatus: "Available",
        cleaningStatus: "Clean",
        isActive: true,
        propertyId: defaultProperty._id,
      },
      {
        roomNumber: "102",
        roomType: "Bachelor",
        basePrice: 1500,
        bookingStatus: "Available",
        cleaningStatus: "Clean",
        isActive: true,
        propertyId: defaultProperty._id,
      },
      {
        roomNumber: "T-01",
        roomType: "Tent",
        basePrice: 1000,
        bookingStatus: "Available",
        cleaningStatus: "Clean",
        isActive: true,
        propertyId: defaultProperty._id,
      },
      {
        roomNumber: "V-01",
        roomType: "VIP Room",
        basePrice: 5000,
        bookingStatus: "Available",
        cleaningStatus: "Clean",
        isActive: true,
        propertyId: defaultProperty._id,
      },
    ];

    for (const roomData of defaultRooms) {
      let room = await Room.findOne({ roomNumber: roomData.roomNumber });
      if (!room) {
        await Room.create(roomData);
        console.log(`🏨 Room ${roomData.roomNumber} (${roomData.roomType}) seeded successfully.`);
      }
    }
  } catch (error) {
    console.error("❌ Room Seeder Error:", error.message);
  }
};

module.exports = seedRooms;
