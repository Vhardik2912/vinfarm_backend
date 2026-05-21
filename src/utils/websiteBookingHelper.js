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

async function findAvailableRoomForStay(roomType, checkInDate, checkOutDate) {
  const rooms = await Room.find({
    roomType,
    isDeleted: false,
    bookingStatus: BOOKING_STATUS.AVAILABLE,
  }).sort({ roomNumber: 1 });

  for (const room of rooms) {
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
    if (!conflict) return room;
  }
  return null;
}

/**
 * Creates a pending Booking for a website CustomerProfile (if a room is free).
 * Returns populated booking doc or null when no room is available.
 */
async function createPendingBookingForProfile(user, profile, customerRole, roomTypeLabel = "") {
  const guestsNum = parseGuestCount(profile.numberOfGuests);

  const existingPending = await Booking.findOne({
    customerId: user._id,
    isDeleted: false,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
  });
  if (existingPending) return existingPending;

  const room = await findAvailableRoomForStay(
    profile.roomType,
    profile.checkIn,
    profile.checkOut
  );
  if (!room) return null;

  const nights = calcNights(profile.checkIn, profile.checkOut);
  const baseAmount = room.basePrice * nights;

  const booking = await Booking.create({
    customerId: user._id,
    roleId: customerRole?._id || user.roleId,
    roomId: room._id,
    checkInDate: profile.checkIn,
    checkOutDate: profile.checkOut,
    numberOfGuests: guestsNum,
    baseAmount,
    totalAmount: baseAmount,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.PENDING,
    specialRequests: roomTypeLabel
      ? `Website request — ${roomTypeLabel}`
      : "Website booking request",
    paymentMethod: null,
  });

  profile.price = baseAmount;
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
