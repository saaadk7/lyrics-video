const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Load environment variables
const { execSync } = require("child_process");

const YT_DLP_PATH = process.env.YT_DLP_PATH || "yt-dlp";
console.log("Using yt-dlp path:", YT_DLP_PATH);


const app = express();

// Handle uncaught exceptions
app.get("/debug/shell", async (req, res) => {
  const { exec } = require("child_process");

  exec("which yt-dlp", (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error.message);
      return res.status(500).json({ error: "Command failed", details: error.message });
    }

    res.json({
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    });
  });
});

// Middleware to parse JSON
app.use(express.json());

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://lyrics-video-production.up.railway.app", // Add your deployed frontend URL here
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
  })
);

// Ensure the output directory exists
const outputPath = path.join(__dirname, "output");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

// Serve the output directory for processed videos
app.use("/output", express.static(outputPath));

// Routes
const validateRoute = require("./routes/validate");
const downloadRoute = require("./routes/download");
const processRoute = require("./routes/process");

// Register API routes
app.use("/api/validate-url", validateRoute);
app.use("/api/download", downloadRoute);
app.use("/api/process", processRoute);

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, "../frontend/build");

if (process.env.NODE_ENV === "production") {
  if (fs.existsSync(frontendBuildPath)) {
    console.log("Serving frontend build...");
    app.use(express.static(frontendBuildPath));

    // Catch-all route for React
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(frontendBuildPath, "index.html"));
    });
  } else {
    console.warn("Frontend build not found. Please ensure the frontend is built.");
  }
} else {
  console.warn("Running in development mode. Frontend not served.");
}

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
