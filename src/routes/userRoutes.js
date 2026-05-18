const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// Using ONLY GET and POST HTTP Methods
// upload.single("idProof") intercepts the multi-part form data to upload the file to local disk
router.post("/post", upload.single("idProof"), createUser);
router.get("/get", getUsers);
router.post("/getid", getUser);
router.post("/put", upload.single("idProof"), updateUser);
router.post("/delete", deleteUser);

module.exports = router;
