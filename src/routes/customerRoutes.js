const express = require("express");
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

// Using ONLY GET and POST HTTP Methods (No file upload middleware needed for customers)
router.post("/post", createCustomer);
router.get("/get", getCustomers);
router.post("/getid", getCustomer);
router.post("/put", updateCustomer);
router.post("/delete", deleteCustomer);

module.exports = router;
