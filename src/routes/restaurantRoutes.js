const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createRestaurantSchema,
  updateRestaurantSchema,
} = require("../validations/restaurantValidation");
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const router = express.Router();

router.get("/get", getRestaurants);
router.get("/getid/:id", getRestaurant);
router.post("/post", protect, validate(createRestaurantSchema), createRestaurant);
router.put("/put/:id", protect, validate(updateRestaurantSchema), updateRestaurant);
router.delete("/delete/:id", protect, deleteRestaurant);

module.exports = router;
