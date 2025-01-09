const express = require("express");
const { exec } = require("child_process");

const router = express.Router();

// Use environment variable or fallback for yt-dlp path
const YT_DLP_PATH = process.env.YT_DLP_PATH || "yt-dlp";

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

  // Ensure yt-dlp is available
  const checkCommand = `command -v ${YT_DLP_PATH}`;
  console.log(`Checking for yt-dlp: ${checkCommand}`);

  exec(checkCommand, (checkError, checkStdout, checkStderr) => {
    if (checkError || !checkStdout.trim()) {
      console.error("yt-dlp not found:", checkStderr || checkError.message);
      return res.status(500).json({
        error: "yt-dlp is not installed or not found in the specified path.",
        details: checkStderr || checkError.message,
      });
    }

    console.log(`yt-dlp found at: ${checkStdout.trim()}`);

    // Run yt-dlp to validate the URL and fetch video info
    const command = `${YT_DLP_PATH} --dump-json "${youtubeURL}"`;
    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Validation error:", error.message);
        return res.status(500).json({
          error: "Error validating YouTube URL.",
          details: error.message,
        });
      }

      if (stderr) {
        console.error("Validation stderr:", stderr);
        return res.status(500).json({
          error: "Error processing the YouTube URL.",
          details: stderr,
        });
      }

      try {
        console.log("yt-dlp stdout:", stdout);
        const videoInfo = JSON.parse(stdout); // Parse video info from yt-dlp output

        // Return a success response with video title
        return res.json({
          valid: true,
          title: videoInfo.title,
          description: videoInfo.description || "No description available.",
        });
      } catch (parseError) {
        console.error("Error parsing video info:", parseError.message);
        return res.status(500).json({
          error: "Error parsing video information.",
          details: parseError.message,
        });
      }
    });
  });
});

module.exports = router;
