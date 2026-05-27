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
  submitWebsiteBooking,
  approveWebsiteRequest,
  rejectWebsiteRequest,
} = require("../controllers/customerController");

const router = express.Router();

// ─── PUBLIC: Website booking form submission (no auth) ────────────────────────
router.post("/website-booking", submitWebsiteBooking);

router.get("/get", protect, getCustomers);
router.get("/getid/:id", protect, getCustomer);
router.post("/approve-request/:id", protect, approveWebsiteRequest);
router.post("/reject-request/:id", protect, rejectWebsiteRequest);
router.post("/post", protect, upload.single("document"), validate(createCustomerSchema), createCustomer);
router.put("/put/:id", protect, upload.single("document"), validate(updateCustomerSchema), updateCustomer);
router.delete("/delete/:id", protect, deleteCustomer);

module.exports = router;
