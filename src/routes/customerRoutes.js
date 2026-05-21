const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createCustomerSchema, updateCustomerSchema } = require("../validations/validationSchemas");
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  submitWebsiteBooking
} = require("../controllers/customerController");

const router = express.Router();

// ─── PUBLIC: Website booking form submission (no auth) ────────────────────────
router.post("/website-booking", submitWebsiteBooking);

// ─── Apply auth middleware to all customer routes ─────────────────────────────
router.use(protect);

router.get("/get", getCustomers);
router.get("/getid/:id", getCustomer);
router.post("/post", upload.single("document"), validate(createCustomerSchema), createCustomer);
router.put("/put/:id", upload.single("document"), validate(updateCustomerSchema), updateCustomer);
router.delete("/delete/:id", deleteCustomer);

module.exports = router;
