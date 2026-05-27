const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const {
  createRestaurantMenuSchema,
  updateRestaurantMenuSchema,
} = require("../validations/restaurantMenuValidation");
const {
  getRestaurantMenus,
  getRestaurantMenu,
  createRestaurantMenu,
  updateRestaurantMenu,
  deleteRestaurantMenu,
} = require("../controllers/restaurantMenuController");

const router = express.Router();

router.get("/get", getRestaurantMenus);
router.get("/getid/:id", getRestaurantMenu);
router.post(
  "/post",
  protect,
  upload.single("image"),
  validate(createRestaurantMenuSchema),
  createRestaurantMenu
);
router.put(
  "/put/:id",
  protect,
  upload.single("image"),
  validate(updateRestaurantMenuSchema),
  updateRestaurantMenu
);
router.delete("/delete/:id", protect, deleteRestaurantMenu);

module.exports = router;
