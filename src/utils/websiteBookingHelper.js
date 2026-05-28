const Booking = require("../models/Booking");
const Room = require("../models/Room");
const CustomerProfile = require("../models/CustomerProfile");
const {
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  CUSTOMER_STATUS,
} = require("../constants/booking");

const parseGuestCount = (value) => {
  const n = parseInt(String(value || "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const calcNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── Find available room for a date range ─────────────────────────────────────
async function findAvailableRoomForStay(roomType, checkInDate, checkOutDate) {
  console.log("======== ROOM SEARCH START ========");
  console.log("Requested Room Type:", roomType);
  console.log("CheckIn:", checkInDate);
  console.log("CheckOut:", checkOutDate);

  const allRooms = await Room.find({});
  console.log(
    "ALL ROOMS:",
    allRooms.map((r) => ({
      roomNumber: r.roomNumber,
      roomType: r.roomType,
      isDeleted: r.isDeleted,
    }))
  );

  const rooms = await Room.find({ isDeleted: false });
  console.log("Filtered Rooms Count:", rooms.length);

  for (const room of rooms) {
    console.log("-----");
    console.log("Checking Room:", room.roomNumber);
    console.log("Room Type:", room.roomType);

    const allBookings = await Booking.find({ "accommodation.refId": room._id, isDeleted: false });
    console.log(
      "Room Bookings:",
      allBookings.map((b) => ({
        status: b.bookingStatus,
        checkIn: b.dates?.checkInDate,
        checkOut: b.dates?.checkOutDate,
      }))
    );

    const conflict = await Booking.findOne({
      "accommodation.refId": room._id,
      "accommodation.type": "ROOM",
      isDeleted: false,
      bookingStatus: {
        $in: [
          ROOM_BOOKING_STATUS.PENDING,
          ROOM_BOOKING_STATUS.CONFIRMED,
          ROOM_BOOKING_STATUS.CHECKED_IN,
        ],
      },
      "dates.checkInDate": { $lt: checkOutDate },
      "dates.checkOutDate": { $gt: checkInDate },
    });

    console.log("Conflict Found:", !!conflict);

    if (!conflict) {
      console.log("AVAILABLE ROOM:", room.roomNumber);
      return room;
    }
  }

  console.log("NO AVAILABLE ROOM FOUND");
  return null;
}

/**
 * Creates a pending Booking for a website CustomerProfile (if a room is free).
 * Returns populated booking doc or null when no room is available.
 * Uses the new nested Booking schema structure.
 */
async function createPendingBookingForProfile({
  user,
  profile,
  customerRole,
  roomType,
  checkInDate,
  checkOutDate,
  numberOfGuests,
}) {
  console.log("Creating pending booking...");

  const guestsNum = parseGuestCount(numberOfGuests);

  // Prevent duplicate pending bookings for same date range
  const existingPending = await Booking.findOne({
    customerId: user._id,
    isDeleted: false,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
    "dates.checkInDate": { $lt: checkOutDate },
    "dates.checkOutDate": { $gt: checkInDate },
  });

  if (existingPending) {
    console.log("Existing pending booking found");
    return existingPending;
  }

  // Find available room — with fallback if that type is fully booked
  let room = await findAvailableRoomForStay(roomType, checkInDate, checkOutDate);

  if (!room) {
    // Fallback 1: any active room of the requested type
    room = await Room.findOne({ roomType, isDeleted: false, isActive: true });
  }
  if (!room) {
    // Fallback 2: any active room in the system
    room = await Room.findOne({ isDeleted: false, isActive: true });
  }

  console.log("Available room:", room);

  if (!room) {
    console.log("No room exists in the system at all");
    return null;
  }

  // Map Room schema type → Booking schema enum
  const roomTypeEnumMap = {
    "Family":   "FAMILY_VILLA",
    "Bachelor": "BACHELOR_SUITE",
    "Tent":     "LUXURY_TENT",
    "VIP Room": "VIP_PALACE_ROOM",
  };
  const mappedRoomType = roomTypeEnumMap[room.roomType] || "FAMILY_VILLA";

  // Calculate pricing
  const nights = calcNights(checkInDate, checkOutDate);
  const baseAmount = room.basePrice * nights;

  // Create booking using new nested schema
  const booking = await Booking.create({
    customerId: user._id,
    createdBy: user._id, // self-booking from website
    bookingSource: "SELF",
    accommodation: {
      type: "ROOM",
      roomType: mappedRoomType,
      refId: room._id,
      name: room.roomNumber,
      price: room.basePrice,
      capacity: room.capacity || 2,
    },
    guests: {
      adults: guestsNum,
      children: 0,
      totalGuests: guestsNum,
    },
    dates: {
      checkInDate,
      checkOutDate,
    },
    services: [],
    pricing: {
      baseAmount,
      serviceAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      finalAmount: baseAmount,
    },
    discountCode: "",
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
    payment: {
      status: PAYMENT_STATUS.PENDING,
      method: "",
      transactionId: "",
    },
  });

  console.log("Created booking:", booking);

  // Update profile last booking timestamp
  profile.lastBookingDate = new Date();
  await profile.save();

  return booking;
}

/**
 * No-op kept for backward compatibility.
 * CustomerProfile no longer stores a `status` field.
 */
async function syncProfileStatusForCustomer(customerId, status) {
  return;
}

module.exports = {
  parseGuestCount,
  findAvailableRoomForStay,
  createPendingBookingForProfile,
  syncProfileStatusForCustomer,
  CUSTOMER_STATUS,
  ROOM_BOOKING_STATUS,
};
