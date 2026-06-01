const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createHousekeepingSchema,
  updateHousekeepingSchema,
} = require("../validations/housekeepingValidation");
const {
  getHousekeepingTasks,
  getHousekeepingTask,
  createHousekeepingTask,
  updateHousekeepingTask,
  assignHousekeepingStaff,
  deleteHousekeepingTask,
} = require("../controllers/housekeepingController");

const router = express.Router();

router.get("/get", protect, getHousekeepingTasks);
router.get("/getid/:id", protect, getHousekeepingTask);
router.post("/post", protect, validate(createHousekeepingSchema), createHousekeepingTask);
router.put("/put/:id", protect, validate(updateHousekeepingSchema), updateHousekeepingTask);
router.put("/assign/:id", protect, assignHousekeepingStaff);
router.delete("/delete/:id", protect, deleteHousekeepingTask);

module.exports = router;
