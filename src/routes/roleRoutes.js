const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getRoles, getRole, createRole, updateRole, deleteRole } = require("../controllers/roleController");

const router = express.Router();

router.get("/get", protect, getRoles);
router.get("/getid/:id", protect, getRole);
router.post("/post", protect, createRole);
router.put("/put/:id", protect, updateRole);
router.delete("/delete/:id", protect, deleteRole);

module.exports = router;
