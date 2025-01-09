const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Load environment variables

const app = express();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Middleware to parse JSON
app.use(express.json());

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Routes
const validateRoute = require("./routes/validate");
const downloadRoute = require("./routes/download");
const processRoute = require("./routes/process");

// Register API routes
app.use("/api/validate-url", validateRoute);
app.use("/api/download", downloadRoute);
app.use("/api/process", processRoute);

// Ensure the output directory exists
const outputPath = path.join(__dirname, "output");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

// Serve the output directory for processed videos
app.use("/output", express.static(outputPath));

// Serve frontend build for production or development
const frontendBuildPath = path.join(__dirname, "../frontend/build");
if (process.env.NODE_ENV === "production" || fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // Catch-all route for React frontend
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, "index.html"));
  });
} else {
  console.warn("Frontend build not found. Backend running without frontend.");
}

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
