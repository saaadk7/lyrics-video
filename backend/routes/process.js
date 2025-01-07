const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const router = express.Router();

const DOWNLOADS_DIR = path.join(__dirname, "../downloads");
const OUTPUT_DIR = path.join(__dirname, "../output");
const BACKGROUND_IMAGE = path.join(__dirname, "../background.jpg");
const YT_DLP_PATH = process.env.YT_DLP_PATH || "yt-dlp";

if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

router.post("/", (req, res) => {
  const { youtubeURL } = req.body;

  if (!youtubeURL) {
    return res.status(400).json({ error: "YouTube URL is required." });
  }

  const uniqueId = Date.now();
  const rawVideoPath = path.join(DOWNLOADS_DIR, `video_${uniqueId}`);
  const mp4VideoPath = path.join(DOWNLOADS_DIR, `video_${uniqueId}.mp4`);
  const outputPath = path.join(OUTPUT_DIR, `output_${uniqueId}.mp4`);

  const downloadCommand = `${YT_DLP_PATH} --write-subs --write-auto-sub --sub-lang en --convert-subs srt -f bestvideo+bestaudio --merge-output-format mp4 -o "${rawVideoPath}.%(ext)s" "${youtubeURL}"`;
  console.log("Executing command:", downloadCommand);

  exec(downloadCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Download error:", error.message);
      return res.status(500).json({ error: "Error downloading video or subtitles", details: error.message });
    }

    const files = fs.readdirSync(DOWNLOADS_DIR);
    const downloadedVideo = files.find((file) => file.startsWith(`video_${uniqueId}`) && file.endsWith(".mp4"));
    const downloadedSubtitles = files.find((file) => file.startsWith(`video_${uniqueId}`) && file.endsWith(".srt"));

    if (!downloadedVideo) {
      console.error("Downloaded video not found.");
      return res.status(500).json({ error: "Downloaded video not found." });
    }

    const videoPath = path.join(DOWNLOADS_DIR, downloadedVideo);
    const subtitlesPath = downloadedSubtitles
      ? path.join(DOWNLOADS_DIR, downloadedSubtitles)
      : null;

    if (!fs.existsSync(BACKGROUND_IMAGE)) {
      console.error("Error: Background image not found.");
      return res.status(400).json({ error: "Background image not found." });
    }

    const filters = [
      "[0:v]scale=1920:1080[bg]",
      "[1:v]scale=1280:720[video]",
      "[bg][video]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[out]",
    ];

    if (subtitlesPath) {
      filters.push(`[out]subtitles=${subtitlesPath}:force_style='Fontsize=24,PrimaryColour=&HFFFFFF&'[final]`);
    }

    const filterComplex = subtitlesPath
      ? filters.join(";")
      : filters.slice(0, -1).join(";"); // Exclude the subtitle filter if no subtitles exist

    ffmpeg()
      .input(BACKGROUND_IMAGE)
      .input(videoPath)
      .complexFilter(filterComplex, "final")
      .outputOptions(["-c:v libx264", "-preset fast", "-crf 23"])
      .save(outputPath)
      .on("end", () => {
        console.log("Video processing complete:", outputPath);

        // Cleanup
        fs.unlink(videoPath, (err) => {
          if (err) console.error("Error deleting video:", err.message);
        });
        if (subtitlesPath) {
          fs.unlink(subtitlesPath, (err) => {
            if (err) console.error("Error deleting subtitles:", err.message);
          });
        }

        res.json({ videoUrl: `/output/${path.basename(outputPath)}` });
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        res.status(500).json({ error: "Error processing video with FFmpeg", details: err.message });
      });
  });
});

module.exports = router;

