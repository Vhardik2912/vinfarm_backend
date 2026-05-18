const express = require("express");
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const router = express.Router();

// Using ONLY GET and POST HTTP Methods
router.post("/post", createRoom);
router.get("/get", getRooms);
router.post("/getid", getRoom);
router.post("/put", updateRoom);
router.post("/delete", deleteRoom);

module.exports = router;
