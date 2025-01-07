import React, { useState } from "react";
import axios from "axios";

const InputForm = ({ setVideoUrl }) => {
  const [youtubeURL, setYoutubeURL] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/process-video", { youtubeURL });
      setVideoUrl(response.data.videoUrl);
    } catch (error) {
      console.error("Error processing video:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={youtubeURL}
        onChange={(e) => setYoutubeURL(e.target.value)}
      />
      <button type="submit">Generate Video</button>
    </form>
  );
};

export default InputForm;
