const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});




// Middleware
app.use(express.json());
app.use(cors());

// Routes
const validateRoute = require("./routes/validate");
const downloadRoute = require("./routes/download");
const processRoute = require("./routes/process");

// Register API routes
app.use("/api/validate-url", validateRoute);
app.use("/api/download", downloadRoute);
app.use("/api/process", processRoute);

// Serve output directory for processed videos
const outputPath = path.join(__dirname, "output");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath); // Ensure the output directory exists
}
//app.use("/output", express.static(outputPath));
app.use("/output", express.static(path.join(__dirname, "output")));

// Serve frontend build for production or development
const frontendPath = path.join(__dirname, "../frontend/build");
if (process.env.NODE_ENV === "production" || fs.existsSync(frontendPath)) {
  app.use(express.static(frontendBuildPath));

  // Catch-all for React routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
} else {
  console.warn("Frontend build not found. Backend running without frontend.");
}
require('dotenv').config();
// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
