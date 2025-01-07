const ytdl = require("@distube/ytdl-core");
const fs = require("fs");

const youtubeURL = "https://www.youtube.com/watch?v=P5oF2WjJ1kg"; // Replace with a valid URL
const videoPath = "./video-test.mp4";

console.log("Starting download...");
const videoStream = ytdl(youtubeURL, { quality: "highestvideo" });
const writeStream = fs.createWriteStream(videoPath);

videoStream.pipe(writeStream).on("finish", () => {
  console.log("Video downloaded successfully:", videoPath);
});

videoStream.on("error", (error) => {
  console.error("Error during download:", error.message);
});
