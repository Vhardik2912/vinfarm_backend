const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");


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


// ─── MongoDB Connection (Alternative: Direct in server.js) ───
const runSeeders = require("./src/seeders");

mongoose
  .connect(process.env.MONGO_URI)
  .then((conn) => {
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    // Run automated database seeders
    runSeeders();
  })
  .catch((error) => {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  });

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/roleRoutes", require("./src/routes/roleRoutes"));
app.use("/api/staffRoutes", require("./src/routes/staffRoutes"));
app.use("/api/customerRoutes", require("./src/routes/customerRoutes"));
app.use("/api/roomRoutes", require("./src/routes/roomRoutes"));
app.use("/api/loginRoutes", require("./src/login/loginRoutes"));
app.use("/api/authRoutes", require("./src/login/loginRoutes"));

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
