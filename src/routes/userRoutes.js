const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createUserSchema, updateUserSchema } = require("../validations/validationSchemas");
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.get("/get", protect, getUsers);
router.get("/getid/:id", protect, getUser);
router.post("/post", protect, upload.single("idProof"), validate(createUserSchema), createUser);
router.put("/put/:id", protect, upload.single("idProof"), validate(updateUserSchema), updateUser);
router.delete("/delete/:id", protect, deleteUser);

module.exports = router;
