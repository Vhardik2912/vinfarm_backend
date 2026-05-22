const Booking = require("../models/Booking");
const Room = require("../models/Room");
const CustomerProfile = require("../models/CustomerProfile");
const {
  ROOM_BOOKING_STATUS,
  PAYMENT_STATUS,
  CUSTOMER_STATUS,
} = require("../constants/booking");
const { BOOKING_STATUS } = require("../constants/constants");

const parseGuestCount = (value) => {
  const n = parseInt(String(value || "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const calcNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// async function findAvailableRoomForStay(roomType, checkInDate, checkOutDate) {
//   const rooms = await Room.find({
//     roomType,
//     isDeleted: false,
//     isActive: true,
//     // bookingStatus: BOOKING_STATUS.AVAILABLE,
//   }).sort({ roomNumber: 1 });

//   for (const room of rooms) {
//     const conflict = await Booking.findOne({
//       roomId: room._id,
//       isDeleted: false,
//       bookingStatus: {
//         $in: [
//           ROOM_BOOKING_STATUS.PENDING,
//           ROOM_BOOKING_STATUS.CONFIRMED,
//           ROOM_BOOKING_STATUS.CHECKED_IN,
//         ],
//       },
//       checkInDate: { $lt: checkOutDate },
//       checkOutDate: { $gt: checkInDate },
//     });
//     if (!conflict) return room;
//   }
//   return null;
// }
async function findAvailableRoomForStay(
  roomType,
  checkInDate,
  checkOutDate
) {

  console.log("======== ROOM SEARCH START ========");

  console.log("Requested Room Type:", roomType);
  console.log("CheckIn:", checkInDate);
  console.log("CheckOut:", checkOutDate);

  // GET ALL ROOMS FIRST
  const allRooms = await Room.find({});

  console.log(
    "ALL ROOMS:",
    allRooms.map(r => ({
      roomNumber: r.roomNumber,
      roomType: r.roomType,
      isDeleted: r.isDeleted,
      bookingStatus: r.bookingStatus,
    }))
  );

  // REMOVE ROOM TYPE FILTER TEMPORARILY
  const rooms = await Room.find({
    isDeleted: false,
  });

  console.log("Filtered Rooms Count:", rooms.length);

  for (const room of rooms) {

    console.log("-----");
    console.log("Checking Room:", room.roomNumber);
    console.log("Room Type:", room.roomType);

    // FIND ALL BOOKINGS FOR ROOM
    const allBookings = await Booking.find({
      roomId: room._id,
      isDeleted: false,
    });

    console.log(
      "Room Bookings:",
      allBookings.map(b => ({
        status: b.bookingStatus,
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
      }))
    );

    // CHECK CONFLICT
    const conflict = await Booking.findOne({
      roomId: room._id,

      isDeleted: false,

      bookingStatus: {
        $in: [
          ROOM_BOOKING_STATUS.PENDING,
          ROOM_BOOKING_STATUS.CONFIRMED,
          ROOM_BOOKING_STATUS.CHECKED_IN,
        ],
      },

      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
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
 */
// async function createPendingBookingForProfile(user, profile, customerRole, roomTypeLabel = "") {
//   console.log("Creating pending booking for profile:", profile);
//   const guestsNum = parseGuestCount(profile.numberOfGuests);
// console.log(guestsNum,"ppp");

//   const existingPending = await Booking.findOne({
//     customerId: user._id,
//     isDeleted: false,
//     bookingStatus: ROOM_BOOKING_STATUS.PENDING,
//   });
//   if (existingPending) return existingPending;

//   const room = await findAvailableRoomForStay(
//     profile.roomType,
//     profile.checkIn,
//     profile.checkOut
//   );
//   if (!room) return null;

//   const nights = calcNights(profile.checkIn, profile.checkOut);
//   const baseAmount = room.basePrice * nights;

//   const booking = await Booking.create({
//     customerId: user._id,
//     roleId: customerRole?._id || user.roleId,
//     roomId: room._id,
//     checkInDate: profile.checkIn,
//     checkOutDate: profile.checkOut,
//     numberOfGuests: guestsNum,
//     baseAmount,
//     totalAmount: baseAmount,
//     bookingStatus: ROOM_BOOKING_STATUS.PENDING,
//     paymentStatus: PAYMENT_STATUS.PENDING,
//     specialRequests: roomTypeLabel
//       ? `Website request — ${roomTypeLabel}`
//       : "Website booking request",
//     paymentMethod: null,
//   });

//   profile.price = baseAmount;
//   await profile.save();
// console.log("Created booking:", booking);
//   return booking;
// }
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

  // Prevent duplicate pending bookings
  const existingPending = await Booking.findOne({
    customerId: user._id,
    isDeleted: false,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,

    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  });

  if (existingPending) {
    console.log("Existing pending booking found");
    return existingPending;
  }

  // Find available room
  const room = await findAvailableRoomForStay(
    roomType,
    checkInDate,
    checkOutDate
  );

  console.log("Available room:", room);

  if (!room) {
    console.log("No room available");
    return null;
  }

  // Calculate amount
  const nights = calcNights(checkInDate, checkOutDate);

  const baseAmount = room.basePrice * nights;

  // Create booking
  const booking = await Booking.create({
    customerId: user._id,

    roleId: customerRole?._id || user.roleId,

    roomId: room._id,

    checkInDate,
    checkOutDate,

    numberOfGuests: guestsNum,

    baseAmount,
    totalAmount: baseAmount,

    bookingStatus: ROOM_BOOKING_STATUS.PENDING,

    paymentStatus: PAYMENT_STATUS.PENDING,

    specialRequests: roomType
      ? `Website request — ${roomType}`
      : "Website booking request",

    paymentMethod: null,
  });

  console.log("Created booking:", booking);

  // Optional profile updates
  profile.lastBookingDate = new Date();

  await profile.save();

  return booking;
}

async function syncProfileStatusForCustomer(customerId, status) {
  if (!customerId) return;
  const profile = await CustomerProfile.findOne({ userId: customerId });
  if (!profile) return;
  profile.status = status;
  await profile.save();
}

module.exports = {
  parseGuestCount,
  findAvailableRoomForStay,
  createPendingBookingForProfile,
  syncProfileStatusForCustomer,
  CUSTOMER_STATUS,
  ROOM_BOOKING_STATUS,
  BOOKING_STATUS,
};
