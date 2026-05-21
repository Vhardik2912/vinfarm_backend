const Booking = require("../models/Booking");
const User = require("../models/User");
const Room = require("../models/Room");
const Role = require("../models/Role");

const seedBookings = async () => {
  try {
    const customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
      console.error("❌ Customer role not found. Run roleSeeder first.");
      return;
    }

    const customers = await User.find({ roleId: customerRole._id, isDeleted: { $ne: true } }).limit(3);
    const rooms = await Room.find({
      isDeleted: false,
      bookingStatus: "Available",
    }).limit(3);

    if (!customers.length || !rooms.length) {
      console.log("⚠️  bookingSeeder: skip — need customers and available rooms.");
      return;
    }

    const templates = [
      {
        customerIdx: 0,
        roomIdx: 0,
        daysFromNow: 4,
        nights: 2,
        guests: 2,
        note: "Weekend stay — requested via website, awaiting manager approval.",
      },
      {
        customerIdx: 1,
        roomIdx: Math.min(1, rooms.length - 1),
        daysFromNow: 7,
        nights: 3,
        guests: 3,
        note: "Corporate booking — pending approval before room is held.",
      },
    ];

    let created = 0;
    for (const t of templates) {
      const customer = customers[t.customerIdx];
      const room = rooms[t.roomIdx];
      if (!customer || !room) continue;

      const duplicate = await Booking.findOne({
        customerId: customer._id,
        roomId: room._id,
        bookingStatus: "pending",
        isDeleted: false,
      });
      if (duplicate) continue;

      const checkIn = new Date();
      checkIn.setHours(0, 0, 0, 0);
      checkIn.setDate(checkIn.getDate() + t.daysFromNow);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + t.nights);

      const baseAmount = room.basePrice * t.nights;

      await Booking.create({
        customerId: customer._id,
        roleId: customer.roleId,
        roomId: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: t.guests,
        baseAmount,
        totalAmount: baseAmount,
        bookingStatus: "pending",
        paymentStatus: "pending",
        paymentMethod: "UPI",
        specialRequests: t.note,
      });
      created += 1;
      console.log(`✅ Pending booking seeded: ${customer.name} → Room ${room.roomNumber}`);
    }

    if (created === 0) {
      console.log("ℹ️  bookingSeeder: pending bookings already exist.");
    }
  } catch (error) {
    console.error("❌ bookingSeeder error:", error.message);
  }
};

module.exports = seedBookings;
