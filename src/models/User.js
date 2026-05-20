const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { VALIDATION_MESSAGES, PATTERNS } = require("../constants/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION_MESSAGES.USER.NAME_REQUIRED],
      trim: true,
    },
    email: {
      type: String,
      required: [true, VALIDATION_MESSAGES.USER.EMAIL_REQUIRED],
      unique: true,
      match: [
        PATTERNS.EMAIL,
        VALIDATION_MESSAGES.USER.EMAIL_VALID,
      ],
    },
    number: {
      type: String,
      required: [true, VALIDATION_MESSAGES.USER.NUMBER_REQUIRED],
      match: [
        PATTERNS.PHONE,
        "Please provide a valid phone number with optional country code",
      ],
    },
    country: {
      type: String,
      required: [true, VALIDATION_MESSAGES.USER.COUNTRY_REQUIRED],
      trim: true,
      default: "India",
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Hidden by default when querying users
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, VALIDATION_MESSAGES.USER.ROLE_REQUIRED],
    },
    status: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false, // Don't return this in normal queries
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// add function for not sending password field response for query

module.exports = mongoose.model("User", userSchema);
