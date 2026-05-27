const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createFoodOrderSchema,
  updateFoodOrderSchema,
} = require("../validations/foodOrderValidation");
const {
  getFoodOrders,
  getFoodOrder,
  createFoodOrder,
  updateFoodOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteFoodOrder,
} = require("../controllers/foodOrderController");

const router = express.Router();

router.get("/get", protect, getFoodOrders);
router.get("/getid/:id", protect, getFoodOrder);
router.post("/post", protect, validate(createFoodOrderSchema), createFoodOrder);
router.put("/put/:id", protect, validate(updateFoodOrderSchema), updateFoodOrder);
router.put("/status/:id", protect, updateOrderStatus);
router.put("/payment/:id", protect, updatePaymentStatus);
router.delete("/delete/:id", protect, deleteFoodOrder);

module.exports = router;
