const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDesignations, getDesignation, createDesignation, updateDesignation, deleteDesignation } = require("../controllers/designationController");

const router = express.Router();

router.get("/get", protect, getDesignations);
router.get("/getid/:id", protect, getDesignation);
router.post("/post", protect, createDesignation);
router.put("/put/:id", protect, updateDesignation);
router.delete("/delete/:id", protect, deleteDesignation);

module.exports = router;
