const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Import routes
const validateRoute = require("./routes/validate");
const downloadRoute = require("./routes/download");
const processRoute = require("./routes/process");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Constants
const DOWNLOADS_DIR = path.join(__dirname, "downloads");

// Serve static files for processed videos
app.use("/downloads", express.static(DOWNLOADS_DIR));

// Routes
app.use("/validate-url", validateRoute);
app.use("/download-video", downloadRoute);
app.use("/process-video", processRoute);

// Default route for the root URL
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Lyrics Video Maker Backend API!",
    routes: {
      validateURL: "POST /validate-url - Validates a YouTube URL",
      downloadVideo: "POST /download-video - Downloads a YouTube video",
      processVideo: "POST /process-video - Processes the video with a background",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong. Please try again later." });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
