const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const staffProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One-to-one mapping with User
    },
    password: {
      type: String,
      required: [true, "Please add a password for Staff login"],
      minlength: 6,
      select: false, // Hidden by default when querying staff profiles
    },
    joindate: {
      type: Date,
      required: [true, "Please add a join date"],
    },
    enddate: {
      type: Date,
      default: null,
    },
    salary: {
      type: Number,
      required: [true, "Please add salary information"],
    },
    idProof: {
      type: String, // Path of uploaded ID document
      required: [true, "Please upload an ID proof document"],
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
staffProfileSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
staffProfileSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("StaffProfile", staffProfileSchema);
