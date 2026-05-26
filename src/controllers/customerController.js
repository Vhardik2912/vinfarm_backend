const User = require("../models/User");
const Role = require("../models/Role");
const CustomerProfile = require("../models/CustomerProfile");
const Booking = require("../models/Booking");
const { catchAsync, successResponse } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");
const { sendBookingEmails } = require("../utils/emailHelper");
const { getPagination } = require("../utils/paginationHelper");
const {
  createPendingBookingForProfile,
  CUSTOMER_STATUS,
  ROOM_BOOKING_STATUS,
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
    isActive: obj.isActive ?? true,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    profile: {
      profileId: obj._id,
      address: obj.address,
      loyaltyPoints: obj.loyaltyPoints || 0,
      document: obj.document || null,
      isActive: obj.isActive ?? true,
      isDeleted: obj.isDeleted ?? false,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    }
  };
};

// @desc    Get all customers (with User and Role populated)
// @route   GET /api/v1/customers/get?page=1&limit=10
// @access  Public
exports.getCustomers = catchAsync("getCustomers", async (req, res, next) => {
  const { skip, limit, buildMeta } = getPagination(req.query);

  const filter = { isDeleted: false };
  const total = await CustomerProfile.countDocuments(filter);

  const customerProfiles = await CustomerProfile.find(filter)
    .populate({
      path: "userId",
      populate: { path: "roleId", select: "name" }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const formattedCustomers = customerProfiles
    .filter(p => p.userId !== null)
    .map(formatCustomer);

  successResponse({
    res,
    data: formattedCustomers,
    other: buildMeta(total),
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
    $or: [{ _id: id }, { userId: id }],
    isDeleted: false
  }).populate({
    path: "userId",
    populate: { path: "roleId", select: "name" }
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
      countryCode,
      address,
      isActive,
    } = req.body;

    // Validation
    if (!name || !email || !phone) {
      throw new AppError("Please provide all required customer details (name, email, phone)", 400);
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
      customerRole = await Role.create({ name: "customer", isActive: true });
    }

    const activeStatus = isActive !== undefined ? isActive : true;

    // Create Core User account
    const user = await User.create({
      name,
      email,
      phone,
      countryCode: countryCode || "+91",
      roleId: customerRole._id,
      isActive: activeStatus,
    });

    // Create Customer Profile
    const profile = await CustomerProfile.create({
      userId: user._id,
      address: address || "",
      document: `/uploads/${req.file.filename}`,
      isActive: activeStatus,
      isDeleted: false,
    });

    const populatedUser = await User.findById(user._id).populate("roleId", "_id name");
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
      countryCode,
      address,
      loyaltyPoints,
      isActive,
      isDeleted,
    } = req.body;

    if (!id) {
      throw new AppError("Please provide a user or profile ID", 400);
    }

    // Find customer profile first
    let customerProfile = await CustomerProfile.findOne({
      $or: [{ _id: id }, { userId: id }],
      isDeleted: false
    });

    if (!customerProfile) {
      throw new AppError("Customer profile not found", 404);
    }

    // Find and update User
    const user = await User.findById(customerProfile.userId);
    if (!user) {
      throw new AppError("Associated customer user account not found", 404);
    }

    const activeStatus = isActive !== undefined ? isActive : user.isActive;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (countryCode !== undefined) user.countryCode = countryCode;
    user.isActive = activeStatus;
    if (isDeleted !== undefined) user.isDeleted = isDeleted;
    await user.save();

    // Update Customer Profile fields
    if (address !== undefined) customerProfile.address = address;
    if (loyaltyPoints !== undefined) customerProfile.loyaltyPoints = loyaltyPoints;
    customerProfile.isActive = activeStatus;
    if (isDeleted !== undefined) customerProfile.isDeleted = isDeleted;

    // Handle new document file upload
    if (req.file) {
      if (customerProfile.document) {
        safeDeleteFile(customerProfile.document);
      }
      customerProfile.document = `/uploads/${req.file.filename}`;
    }

    await customerProfile.save();

    const populatedUser = await User.findById(user._id).populate("roleId", "name");
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

// @desc    Delete customer member (Soft Delete)
// @route   POST /api/v1/customers/delete
// @access  Public
exports.deleteCustomer = catchAsync("deleteCustomer", async (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new AppError("Please provide an ID", 400);
  }

  const customerProfile = await CustomerProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
    isDeleted: false
  });

  if (!customerProfile) {
    throw new AppError("Customer profile not found", 404);
  }

  const user = await User.findById(customerProfile.userId);
  if (!user) {
    throw new AppError("Associated customer user account not found", 404);
  }

  // Soft delete associated user and customer profile
  user.isDeleted = true;
  user.isActive = false;
  await user.save();

  customerProfile.isDeleted = true;
  customerProfile.isActive = false;
  await customerProfile.save();

  successResponse({
    res,
    message: "Customer account and profile deleted successfully (soft deleted)",
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

  let customerRole = await Role.findOne({ name: "customer" });
  if (!customerRole) {
    customerRole = await Role.create({ name: "customer", isActive: true });
  }

  // ── Check if email already exists ───────────────────────────────────────────
  let user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    // Create new User
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: `${countryCode || "+91"} ${phone.trim()}`,
      countryCode: countryCode || "+91",
      roleId: customerRole._id,
      isActive: true,
      isDeleted: false,
    });
  }
  let profile = await CustomerProfile.findOne({
    userId: user._id,
  });
  console.log("Existing profile for user:", profile);

  // ── Create Customer Profile ─────────────────────────────────────────────────
  if (!profile) {
    profile = await CustomerProfile.create({
      userId: user._id,
      isActive: true,
      isDeleted: false,
    });
  }

  // ── Create pending Booking so manager Approval Requests can process it ───
  const pendingBooking = await createPendingBookingForProfile({
    user,
    profile,
    customerRole,
    roomType: dbRoomType,
    checkInDate,
    checkOutDate,
    numberOfGuests,
  });

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
      checkIn: checkInDate,
      checkOut: checkOutDate,
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
    isDeleted: false,
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
    booking = await createPendingBookingForProfile({ user, profile, customerRole });
    if (!booking) {
      throw new AppError(
        "No available room for the requested dates and room type. Assign a room manually or reject the request.",
      );
    }
  }

  if (booking.bookingStatus !== ROOM_BOOKING_STATUS.PENDING) {
    throw new AppError(`Booking is already ${booking.bookingStatus}`, 400);
  }

  booking.bookingStatus = ROOM_BOOKING_STATUS.CONFIRMED;
  await booking.save();

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
    isDeleted: false,
  });
  if (!profile) throw new AppError("Customer request not found", 404);

  const pendingBooking = await Booking.findOne({
    customerId: profile.userId,
    isDeleted: false,
    bookingStatus: ROOM_BOOKING_STATUS.PENDING,
  });

  if (pendingBooking) {
    pendingBooking.bookingStatus = ROOM_BOOKING_STATUS.CANCELLED;
    pendingBooking.cancellation = {
      reason: reason || "Rejected by manager — website request not approved",
      cancelledAt: new Date(),
    };
    await pendingBooking.save();
  }

  successResponse({
    res,
    message: "Booking request rejected",
    data: { profileId: profile._id, userId: profile.userId },
  });
});
