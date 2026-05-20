const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createUserSchema, updateUserSchema } = require("../validations/validationSchemas");
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

// ─── Apply auth middleware to all user routes ─────────────────────────────────
router.use(protect);

router.get("/get", getUsers);
router.get("/getid/:id", getUser);
router.post("/post", upload.single("idProof"), validate(createUserSchema), createUser);
router.put("/put/:id", upload.single("idProof"), validate(updateUserSchema), updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
