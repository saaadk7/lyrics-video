const express = require("express");
const { exec } = require("child_process");

const router = express.Router();

// Full path to the yt-dlp binary (use environment variable or fallback)
const YT_DLP_PATH = process.env.YT_DLP_PATH || "/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp" || "yt-dlp";

router.post("/", (req, res) => {
  const { youtubeURL } = req.body;

  // Check if the URL is provided
  if (!youtubeURL) {
    return res.status(400).json({ error: "YouTube URL is required." });
  }

  // Validate the YouTube URL format
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (!youtubeRegex.test(youtubeURL)) {
    return res.status(400).json({ error: "Invalid YouTube URL format." });
  }

  // Run yt-dlp to validate the URL and fetch video info
  const command = `${YT_DLP_PATH} --dump-json "${youtubeURL}"`;
  console.log("Executing command:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Validation error:", error.message);
      return res.status(500).json({ error: "Error validating YouTube URL.", details: error.message });
    }

    if (stderr) {
      console.error("Validation stderr:", stderr);
      return res.status(500).json({ error: "Error processing the YouTube URL.", details: stderr });
    }

    try {
      console.log("yt-dlp stdout:", stdout);
      const videoInfo = JSON.parse(stdout); // Parse video info from yt-dlp output

      // Return a success response with video title
      return res.json({ valid: true, title: videoInfo.title });
    } catch (parseError) {
      console.error("Error parsing video info:", parseError.message);
      return res.status(500).json({ error: "Error parsing video information.", details: parseError.message });
    }
  });
});

module.exports = router;
