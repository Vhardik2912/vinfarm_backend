const express = require("express");
const validate = require("../middleware/validate");
const { createRoomSchema, updateRoomSchema } = require("../validations/validationSchemas");
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");

const router = express.Router();

router.get("/get", getRooms);
router.get("/getid/:id", getRoom);
router.post("/post", validate(createRoomSchema), createRoom);
router.put("/put/:id", validate(updateRoomSchema), updateRoom);
router.delete("/delete/:id", deleteRoom);

module.exports = router;
