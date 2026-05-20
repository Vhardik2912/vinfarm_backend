const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { loginSchema, registerCustomerSchema } = require("../validations/validationSchemas");
const {
  registerCustomer,
  loginStaff,
  getMe,
} = require("../controllers/loginController");

const router = express.Router();

// Using ONLY GET and POST HTTP Methods

// ─── Customer Registration (Staff cannot register here) ──────
router.post("/register", validate(registerCustomerSchema), registerCustomer);

// ─── Staff Login (Customers cannot login here) ────────────────
router.post("/login", validate(loginSchema), loginStaff);

// ─── Get Current Logged In Profile ──────────────────────────
router.post("/me", protect, getMe);
router.get("/me", protect, getMe);

module.exports = router;
