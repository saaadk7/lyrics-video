import React, { useState } from "react";
import InputForm from "../components/InputForm";
import VideoPlayer from "../components/VideoPlayer";

const Home = () => {
  const [videoUrl, setVideoUrl] = useState("");

  return (
    <div>
      <h1>Lyrics Video Maker</h1>
      <InputForm setVideoUrl={setVideoUrl} />
      <VideoPlayer videoUrl={videoUrl} />
    </div>
  );
};

export default Home;
