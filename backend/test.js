const ytdl = require("ytdl-core");

(async () => {
  try {
    const youtubeURL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Replace with a real YouTube video URL
    const videoInfo = await ytdl.getInfo(youtubeURL);
    console.log("Video Info:", videoInfo.videoDetails.title);
  } catch (error) {
    console.error("Error:", error);
  }
})();
