const express = require("express");
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const router = express.Router();

router.get("/get", getCustomers);
router.get("/getid/:id", getCustomer);
router.post("/post", createCustomer);
router.put("/put/:id", updateCustomer);
router.delete("/delete/:id", deleteCustomer);

module.exports = router;
