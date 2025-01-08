const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const router = express.Router();

const DOWNLOADS_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

router.post("/", async (req, res) => {
  const { youtubeURL } = req.body;

  if (!youtubeURL) {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  const uniqueId = Date.now(); // Unique identifier for the video
  const rawVideoPath = path.join(DOWNLOADS_DIR, `video_${uniqueId}`); // Path without extension
  const finalVideoPath = path.join(DOWNLOADS_DIR, `video_${uniqueId}.mp4`); // Final MP4 file

  const command = `yt-dlp -f best -o "${rawVideoPath}.%(ext)s" "${youtubeURL}"`; // Download with correct extension
  console.log("Executing command:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Download error:", error.message);
      return res.status(500).json({ error: "Error downloading video", details: error.message });
    }

    // Find the downloaded file
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const downloadedFile = files.find((file) => file.startsWith(`video_${uniqueId}`));
    if (!downloadedFile) {
      console.error("Downloaded video file not found.");
      return res.status(500).json({ error: "Downloaded video file not found" });
    }

    const downloadedFilePath = path.join(DOWNLOADS_DIR, downloadedFile);
    console.log("Downloaded video file:", downloadedFilePath);

    // If the file is already MP4, rename and return it
    if (path.extname(downloadedFilePath) === ".mp4") {
      fs.renameSync(downloadedFilePath, finalVideoPath);
      console.log("Video successfully downloaded in MP4 format:", finalVideoPath);
      return res.json({ videoPath: finalVideoPath });
    }

    // Convert to MP4 using FFmpeg if not already in MP4 format
    console.log("Converting video to MP4...");
    ffmpeg(downloadedFilePath)
      .output(finalVideoPath)
      .on("end", () => {
        console.log("Video successfully converted to MP4:", finalVideoPath);

        // Remove the original non-MP4 file
        fs.unlinkSync(downloadedFilePath);

        return res.json({ videoPath: finalVideoPath });
      })
      .on("error", (err) => {
        console.error("Error converting video to MP4:", err.message);
        return res.status(500).json({ error: "Error converting video to MP4", details: err.message });
      })
      .run();
  });
});

module.exports = router;
