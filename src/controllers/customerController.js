const User = require("../models/User");
const Role = require("../models/Role");
const CustomerProfile = require("../models/CustomerProfile");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { sendBookingEmails } = require("../utils/emailHelper");
const {
  createPendingBookingForProfile,
  CUSTOMER_STATUS,
  ROOM_BOOKING_STATUS,
  BOOKING_STATUS,
} = require("../utils/websiteBookingHelper");
const fs = require("fs");
const path = require("path");

// Helper function to delete file safely
const safeDeleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// Helper to format customer object neatly
const formatCustomer = (profile) => {
  if (!profile) return null;
  const obj = profile.toObject ? profile.toObject() : profile;
  const user = obj.userId;
  delete obj.userId;

  return {
    _id: user?._id || null,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleId: user?.roleId || null,
    status: user?.status ?? true,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    profile: {
      profileId: obj._id,
      address: obj.address,
      loyaltyPoints: obj.loyaltyPoints,
      roomType: obj.roomType || null,
      checkIn: obj.checkIn || null,
      checkOut: obj.checkOut || null,
      document: obj.document || null,
      price: obj.price || 0,
      status: obj.status || "pending",
      source: obj.source || "admin",
      numberOfGuests: obj.numberOfGuests || "1",
      country: obj.country || "",
      countryCode: obj.countryCode || "+91",
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    }
  };
};

// @desc    Get all customers (with User and Role populated)
// @route   GET /api/v1/customers/get
// @access  Public
exports.getCustomers = catchAsync("getCustomers", async (req, res, next) => {
  const customerProfiles = await CustomerProfile.find().populate({
    path: "userId",
    populate: { path: "roleId", select: "name status" }
  });

  const formattedCustomers = customerProfiles
    .filter(p => p.userId !== null) // Filter out orphaned profiles
    .map(formatCustomer);

  successResponse({
    res,
    data: formattedCustomers,
  });
});

// @desc    Get single customer profile by User ID or Profile ID
// @route   POST /api/v1/customers/getid
// @access  Public
exports.getCustomer = catchAsync("getCustomer", async (req, res, next) => {
  const id = req.params.id || req.body.id || req.query.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const customerProfile = await CustomerProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  }).populate({
    path: "userId",
    populate: { path: "roleId", select: "name status" }
  });

  if (!customerProfile || !customerProfile.userId) {
    throw new AppError("Customer not found", 404);
  }

  successResponse({
    res,
    data: formatCustomer(customerProfile),
  });
});

// @desc    Create new customer (User + CustomerProfile)
// @route   POST /api/v1/customers/post
// @access  Public
exports.createCustomer = catchAsync("createCustomer", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      roomType,
      checkIn,
      checkOut,
      price,
      status,
    } = req.body;

    // Validation
    if (!name || !email || !phone || !roomType || !checkIn || !checkOut || !price) {
      throw new AppError("Please provide all required customer details (name, email, phone, roomType, checkIn, checkOut, price)", 400);
    }

    if (!req.file) {
      throw new AppError("Please upload a document (ID proof)", 400);
    }

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError("Email is already registered", 400);
    }

    // Find or create default "customer" role
    let customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
      customerRole = await Role.create({ name: "customer", status: true });
    }

    // Create Core User account
    const user = await User.create({
      name,
      email,
      phone,
      roleId: customerRole._id,
      status: true,
    });

    // Create Customer Profile
    const profile = await CustomerProfile.create({
      userId: user._id,
      address: address || "",
      roomType,
      checkIn,
      checkOut,
      document: `/uploads/${req.file.filename}`,
      price,
      status: status || "pending",
    });

    const populatedUser = await User.findById(user._id).populate("roleId", "name status");
    const tempProfile = await CustomerProfile.findById(profile._id);

    successResponse({
      res,
      statusCode: 201,
      data: formatCustomer({ userId: populatedUser, ...tempProfile.toObject() }),
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    throw error;
  }
});

// @desc    Update customer member details
// @route   POST /api/v1/customers/put
// @access  Public
exports.updateCustomer = catchAsync("updateCustomer", async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const {
      name,
      email,
      phone,
      address,
      loyaltyPoints,
      roomType,
      checkIn,
      checkOut,
      price,
      status,
    } = req.body;

    if (!id) {
      throw new AppError("Please provide a user or profile ID", 400);
    }

    // Find customer profile first
    let customerProfile = await CustomerProfile.findOne({
      $or: [{ _id: id }, { userId: id }]
    });

    if (!customerProfile) {
      throw new AppError("Customer profile not found", 404);
    }

    // Find and update User
    const user = await User.findById(customerProfile.userId);
    if (!user) {
      throw new AppError("Associated customer user account not found", 404);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();

    // Update Customer Profile fields
    if (address !== undefined) customerProfile.address = address;
    if (loyaltyPoints !== undefined) customerProfile.loyaltyPoints = loyaltyPoints;
    if (roomType !== undefined) customerProfile.roomType = roomType;
    if (checkIn !== undefined) customerProfile.checkIn = checkIn;
    if (checkOut !== undefined) customerProfile.checkOut = checkOut;
    if (price !== undefined) customerProfile.price = price;
    if (status !== undefined) customerProfile.status = status;

    // Handle new document file upload
    if (req.file) {
      if (customerProfile.document) {
        safeDeleteFile(customerProfile.document);
      }
      customerProfile.document = `/uploads/${req.file.filename}`;
    }

    await customerProfile.save();

    const populatedUser = await User.findById(user._id).populate("roleId", "name status");
    const updatedProfile = await CustomerProfile.findById(customerProfile._id);

    successResponse({
      res,
      data: formatCustomer({ userId: populatedUser, ...updatedProfile.toObject() }),
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    throw error;
  }
});

// @desc    Delete customer member
// @route   POST /api/v1/customers/delete
// @access  Public
exports.deleteCustomer = catchAsync("deleteCustomer", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const customerProfile = await CustomerProfile.findOne({
    $or: [{ _id: id }, { userId: id }]
  });

  if (!customerProfile) {
    throw new AppError("Customer profile not found", 404);
  }

  // 1. Delete document file if exists
  if (customerProfile.document) {
    safeDeleteFile(customerProfile.document);
  }

  // 2. Delete CustomerProfile document
  await CustomerProfile.findByIdAndDelete(customerProfile._id);

  // 3. Delete Core User document
  await User.findByIdAndDelete(customerProfile.userId);

  successResponse({
    res,
    message: "Customer account and profile deleted successfully",
  });
});

// ─── Website Room Type → DB Room Type mapping ─────────────────────────────────
const WEBSITE_ROOM_TYPE_MAP = {
  "family villa": "Family",
  "bachelor suite": "Bachelor",
  "luxury tent": "Tent",
  "vip palace room": "VIP Room",
};

// @desc    Submit booking from public website (NO auth, NO document)
// @route   POST /api/customer/website-booking
// @access  Public
exports.submitWebsiteBooking = catchAsync("submitWebsiteBooking", async (req, res, next) => {
  const {
    name,
    email,
    phone,
    countryCode,
    country,
    checkIn,
    checkOut,
    numberOfGuests,
    roomType,
  } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!name || !email || !phone || !checkIn || !checkOut || !numberOfGuests || !roomType) {
    throw new AppError(
      "Please provide name, email, phone, checkIn, checkOut, numberOfGuests, and roomType.",
      400
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    throw new AppError("Invalid date format.", 400);
  }
  if (checkOutDate <= checkInDate) {
    throw new AppError("Check-out date must be after check-in date.", 400);
  }

  // Map website room type label → DB enum value
  const dbRoomType =
    WEBSITE_ROOM_TYPE_MAP[roomType.toLowerCase().trim()] || "Family";

  // ── Find or create "customer" role ──────────────────────────────────────────
  let customerRole = await Role.findOne({ name: "customer" });
  if (!customerRole) {
    customerRole = await Role.create({ name: "customer", status: true });
  }

  // ── Check if email already exists ───────────────────────────────────────────
  let user = await User.findOne({ email: email.toLowerCase().trim() });

  // if (user) {
  //   throw new AppError("You have already sent a booking request with this email address.", 400);
  // }
  if (!user) {
    // Create new User
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: `${countryCode || "+91"} ${phone.trim()}`,
      roleId: customerRole._id,
      status: true,
    });
  }
  let profile = await CustomerProfile.findOne({
    userId: user._id,
  });
  // ── Create Customer Profile ─────────────────────────────────────────────────
  if (!profile) {
    await CustomerProfile.create({
      userId: user._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      roomType: dbRoomType,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      countryCode: countryCode || "+91",
      country: country || "India",
      numberOfGuests: String(numberOfGuests) || "1 Person",
      source: "website",
      status: "pending",
    });
  }
  const existingPendingBooking = await Booking.findOne({
    customerId: user._id,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
    isDeleted: false,

    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  });

  if (existingPendingBooking) {
    throw new AppError(
      "You already have a pending booking request for selected dates.",
      400
    );
  }

  // ── Create pending Booking so manager Approval Requests can process it ───
  const pendingBooking = await createPendingBookingForProfile(
    user,
    profile,
    customerRole,
    roomType
  );

  // ── Send branded HTML emails (fire-and-forget) ──────────────────────────────
  const customerData = { name: user.name, email: user.email, phone: user.phone };
  const roomMock = { roomNumber: "—", roomType: dbRoomType, basePrice: 0 };
  const bookingMock = {
    checkInDate,
    checkOutDate,
    numberOfGuests: String(numberOfGuests),
    totalAmount: 0,
  };

  sendBookingEmails(bookingMock, roomMock, customerData)
    .then((result) => {
      if (result.success) {
        CustomerProfile.findByIdAndUpdate(profile._id, {
          emailSentToCustomer: true,
          emailSentToAdmin: true,
        }).catch(() => { });

        if (!result.hasSmtpConfig) {
          console.log("📧 [DEV] Customer email preview:", result.customerMailPreview);
          console.log("📧 [DEV] Admin email preview:   ", result.adminMailPreview);
        }
      }
    })
    .catch(() => { });

  // ── Response ────────────────────────────────────────────────────────────────
  successResponse({
    res,
    statusCode: 201,
    message: "Your booking request has been received! We will contact you shortly.",
    data: {
      customerId: user._id,
      profileId: profile._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roomType: dbRoomType,
      checkIn: profile.checkIn,
      checkOut: profile.checkOut,
      status: profile.status,
      bookingId: pendingBooking?._id || null,
      hasPendingBooking: Boolean(pendingBooking),
    },
  });
});

// @desc    Approve website / profile-only request (create booking if needed, then confirm)
// @route   POST /api/customer/approve-request/:id
// @access  Private
exports.approveWebsiteRequest = catchAsync("approveWebsiteRequest", async (req, res, next) => {
  const id = req.params.id;
  const profile = await CustomerProfile.findOne({
    $or: [{ userId: id }, { _id: id }],
  });
  if (!profile) throw new AppError("Customer request not found", 404);

  const user = await User.findById(profile.userId);
  if (!user) throw new AppError("Customer user not found", 404);

  const customerRole = await Role.findById(user.roleId);

  let booking = await Booking.findOne({
    customerId: user._id,
    isDeleted: false,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
  }).sort({ createdAt: -1 });

  if (!booking) {
    booking = await createPendingBookingForProfile(user, profile, customerRole);
    if (!booking) {
      throw new AppError(
        "No available room for the requested dates and room type. Assign a room manually or reject the request.",
        400
      );
    }
  }

  if (booking.bookingStatus !== ROOM_BOOKING_STATUS.PENDING) {
    throw new AppError(`Booking is already ${booking.bookingStatus}`, 400);
  }

  booking.bookingStatus = ROOM_BOOKING_STATUS.CONFIRMED;
  await booking.save();

  const room = await Room.findById(booking.roomId);
  if (room) {
    room.bookingStatus = BOOKING_STATUS.BOOKED;
    await room.save();
  }

  profile.status = CUSTOMER_STATUS.CONFIRMED;
  await profile.save();

  const populated = await Booking.findById(booking._id)
    .populate("customerId", "name email phone")
    .populate("roomId", "roomNumber roomType basePrice");

  successResponse({
    res,
    message: "Booking request approved successfully",
    data: populated,
  });
});

// @desc    Reject website / profile request
// @route   POST /api/customer/reject-request/:id
// @access  Private
exports.rejectWebsiteRequest = catchAsync("rejectWebsiteRequest", async (req, res, next) => {
  const id = req.params.id;
  const { reason } = req.body || {};

  const profile = await CustomerProfile.findOne({
    $or: [{ userId: id }, { _id: id }],
  });
  if (!profile) throw new AppError("Customer request not found", 404);

  const pendingBooking = await Booking.findOne({
    customerId: profile.userId,
    isDeleted: false,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
  });

  if (pendingBooking) {
    pendingBooking.bookingStatus = ROOM_BOOKING_STATUS.CANCELLED;
    pendingBooking.cancellationReason =
      reason || "Rejected by manager — website request not approved";
    pendingBooking.cancelledAt = new Date();
    await pendingBooking.save();
  }

  profile.status = CUSTOMER_STATUS.CANCELLED;
  await profile.save();

  successResponse({
    res,
    message: "Booking request rejected",
    data: { profileId: profile._id, userId: profile.userId },
  });
});
