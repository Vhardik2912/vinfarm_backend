const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { createUserSchema, updateUserSchema } = require("../validations/validationSchemas");
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.get("/get", getUsers);
router.get("/getid/:id", getUser);
router.post("/post", upload.single("idProof"), validate(createUserSchema), createUser);
router.put("/put/:id", upload.single("idProof"), validate(updateUserSchema), updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
