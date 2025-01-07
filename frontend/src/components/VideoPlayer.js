import React from "react";

const VideoPlayer = ({ videoUrl }) => {
  return (
    <div>
      <h3>Generated Video</h3>
      {videoUrl ? (
        <video controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>No video generated yet</p>
      )}
    </div>
  );
};

export default VideoPlayer;
