const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// ─── Import Routes ───────────────────────────────────────────
const roleRoutes = require("./src/routes/roleRoutes");
const staffRoutes = require("./src/routes/staffRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const roomRoutes = require("./src/routes/roomRoutes");
const loginRoutes = require("./src/routes/loginRoutes");
const userRoutes = require("./src/routes/userRoutes");
const designationRoutes = require("./src/routes/designationRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const vehicleRoutes        = require("./src/routes/vehicleRoutes");
const vehicleBookingRoutes = require("./src/routes/vehicleBookingRoutes");
const vehicleMaintenanceRoutes = require("./src/routes/vehicleMaintenanceRoutes");
const restaurantRoutes = require("./src/routes/restaurantRoutes");
const restaurantMenuRoutes = require("./src/routes/restaurantMenuRoutes");
const foodOrderRoutes = require("./src/routes/foodOrderRoutes");
const maintenanceRoutes = require("./src/routes/maintenanceRoutes");
const housekeepingRoutes = require("./src/routes/housekeepingRoutes");



// Load env vars
dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ─── MongoDB Connection ──────────────────────────────────────
const connectDB = require("./src/config/db");
connectDB();

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/role", roleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/user", userRoutes);
app.use("/api/designation", designationRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/vehicle",         vehicleRoutes);
app.use("/api/vehicle-booking", vehicleBookingRoutes);
app.use("/api/vehicle-maintenance", vehicleMaintenanceRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/restaurant-menu", restaurantMenuRoutes);
app.use("/api/food-order", foodOrderRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/housekeeping", housekeepingRoutes);


const errorHandler = require("./src/middleware/errorHandler");
app.use(errorHandler);

// ─── Health Check Route ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌿 Vinfram Resort API is running (Direct DB connection)",
    version: "v1",
  });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
