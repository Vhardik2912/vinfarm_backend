const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  registerCustomer,
  loginStaff,
  getMe,
} = require("./loginController");

const router = express.Router();

// Using ONLY GET and POST HTTP Methods

// ─── Customer Registration (Staff cannot register here) ──────
router.post("/register", registerCustomer);

// ─── Staff Login (Customers cannot login here) ────────────────
router.post("/login", loginStaff);

// ─── Get Current Logged In Profile ──────────────────────────
router.post("/me", protect, getMe);
router.get("/me", protect, getMe);

module.exports = router;
