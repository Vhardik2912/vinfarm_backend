const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getRoles, getRole, createRole, updateRole, deleteRole } = require("../controllers/roleController");

const router = express.Router();

// ─── Apply auth middleware to all role routes ─────────────────────────────────
router.use(protect);

router.get("/get", getRoles);
router.get("/getid/:id", getRole);
router.post("/post", createRole);
router.put("/put/:id", updateRole);
router.delete("/delete/:id", deleteRole);

module.exports = router;
