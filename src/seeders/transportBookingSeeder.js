const TransportBooking = require("../models/TransportBooking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const seedTransportBookings = async () => {
  try {
    const count = await TransportBooking.countDocuments({ isDeleted: false });
    if (count > 0) return;

    const customer = await User.findOne({ email: "customer@example.com" });
    const customer2 = await User.findOne({ email: "sarah.j@resort.com" });
    const vehicle1 = await Vehicle.findOne({ licensePlate: "MH-12-AB-1234" });
    const vehicle2 = await Vehicle.findOne({ licensePlate: "MH-12-CD-5678" });

    if (!customer || !vehicle1) {
      console.log("⚠️ Skipping transport seed — customer or vehicle missing.");
      return;
    }

    const samples = [
      {
        customerId: customer._id,
        vehicleId: vehicle1._id,
        bookingType: "Airport Pickup",
        pickupLocation: "Airport Terminal 2",
        dropoffLocation: "Vinfram Resort",
        pickupDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: "Pending",
        totalPrice: 1200,
      },
      {
        customerId: (customer2 || customer)._id,
        vehicleId: vehicle2?._id || vehicle1._id,
        bookingType: "Car Rental",
        pickupLocation: "Vinfram Resort",
        dropoffLocation: "City Mall",
        pickupDateTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        status: "Confirmed",
        totalPrice: 3500,
      },
      {
        customerId: customer._id,
        vehicleId: vehicle1._id,
        bookingType: "Airport Drop",
        pickupLocation: "Vinfram Resort",
        dropoffLocation: "Airport Terminal 1",
        pickupDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: "Completed",
        totalPrice: 1200,
      },
    ];

    for (const data of samples) {
      await TransportBooking.create(data);
    }
    console.log("🚕 Transport bookings seeded successfully.");
  } catch (error) {
    console.error("❌ Transport Booking Seeder Error:", error.message);
  }
};

module.exports = seedTransportBookings;
