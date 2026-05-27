const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createRoomSchema, updateRoomSchema } = require("../validations/validationSchemas");
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");

const router = express.Router();

router.get("/get", getRooms);
router.get("/getid/:id", getRoom);
router.post("/post", protect, validate(createRoomSchema), createRoom);
router.put("/put/:id", protect, validate(updateRoomSchema), updateRoom);
router.delete("/delete/:id", protect, deleteRoom);

module.exports = router;
