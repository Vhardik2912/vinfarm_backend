const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    number: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Please select a role"],
    },
    status: {
      type: Boolean,
      default: true, // true = active, false = inactive
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
