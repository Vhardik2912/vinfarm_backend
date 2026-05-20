const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const router = express.Router();

// ─── Apply auth middleware to all customer routes ─────────────────────────────
router.use(protect);

router.get("/get", getCustomers);
router.get("/getid/:id", getCustomer);
router.post("/post", createCustomer);
router.put("/put/:id", updateCustomer);
router.delete("/delete/:id", deleteCustomer);

module.exports = router;
