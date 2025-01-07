const express = require("express");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DOWNLOADS_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

router.post("/process-video", async (req, res) => {
  const { youtubeURL } = req.body;

  const videoPath = path.join(DOWNLOADS_DIR, "video.mp4");
  const outputPath = path.join(DOWNLOADS_DIR, "output.mp4");

  try {
    const videoStream = ytdl(youtubeURL, { quality: "highestvideo" });
    const writeStream = fs.createWriteStream(videoPath);

    videoStream.pipe(writeStream).on("finish", () => {
      ffmpeg(videoPath)
        .input("./background.jpg") // Ensure this file exists
        .complexFilter(["overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2"])
        .save(outputPath)
        .on("end", () => {
          res.json({ videoUrl: `/downloads/output.mp4` });
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          res.status(500).send("Error processing video");
        });
    });

    videoStream.on("error", (err) => {
      console.error("Download error:", err);
      res.status(500).send("Error downloading video");
    });
  } catch (error) {
    console.error("General error:", error);
    res.status(500).send("Error processing video");
  }
});

module.exports = router;
