import React, { useState } from "react";
import axios from "axios";

function App() {
  const [youtubeURL, setYoutubeURL] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // URL for the processed video
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(""); // Error message
  const [validated, setValidated] = useState(false); // Validation status
  const [successMessage, setSuccessMessage] = useState(""); // Success message

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const handleValidateURL = async () => {
    setLoading(true);
    setError("");
    setValidated(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/validate-url`, {
        youtubeURL,
      });

      if (response.data.valid) {
        setValidated(true);
        setError("");
        setSuccessMessage("URL validated successfully!");
      } else {
        setValidated(false);
        setError("Invalid YouTube URL. Please check and try again.");
      }
    } catch (error) {
      console.error("Error validating URL:", error);
      setError("Failed to validate the YouTube URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideoUrl("");
    setSuccessMessage("");
  
    if (!validated) {
      setError("Please validate the YouTube URL first.");
      setLoading(false);
      return;
    }
  
    try {
      // Send the request to process the video
      const response = await axios.post(`${API_BASE_URL}/api/process`, {
        youtubeURL,
      });
  
      console.log("Video URL from backend:", response.data.videoUrl); // Debugging log
  
      if (response.data.videoUrl) {
        // Construct the full video URL using API base URL
        const fullVideoUrl = `${API_BASE_URL}${response.data.videoUrl}`;
        console.log("Full video URL constructed:", fullVideoUrl);
  
        setVideoUrl(fullVideoUrl);
        setError("");
        setSuccessMessage("Video processed successfully! You can download it below.");
      } else {
        setError("Failed to process the video. Please try again.");
        console.warn("Response from backend did not include a valid video URL.");
      }
    } catch (error) {
      console.error("Error processing video:", error);
      setError("An error occurred while processing the video. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleDownloadVideo = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "processed_video.mp4"; // Default filename
    link.click();
  };

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2.5em", color: "#333", animation: "fadeIn 2s" }}>
        Lyrics Video Maker
      </h1>
      <form onSubmit={handleProcessVideo} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={youtubeURL}
          onChange={(e) => setYoutubeURL(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "1em",
            width: "300px",
            marginRight: "10px",
            borderRadius: "5px",
            border: validated ? "1px solid #28a745" : "1px solid #ccc",
            transition: "border-color 0.3s",
          }}
        />
        <button
          type="button"
          onClick={handleValidateURL}
          style={{
            padding: "10px 20px",
            fontSize: "1em",
            backgroundColor: validated ? "#28a745" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
            transition: "background-color 0.3s ease",
          }}
        >
          {loading && !validated ? "Validating..." : validated ? "Validated" : "Validate URL"}
        </button>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "1em",
            backgroundColor: validated ? "#007BFF" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: validated ? "pointer" : "not-allowed",
            transition: "background-color 0.3s ease",
          }}
          disabled={!validated || loading}
        >
          {loading && validated ? "Processing..." : "Process Video"}
        </button>
      </form>

      {error && <p style={{ color: "red", animation: "fadeIn 0.5s" }}>{error}</p>}
      {successMessage && <p style={{ color: "green", animation: "fadeIn 0.5s" }}>{successMessage}</p>}

      {videoUrl && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            animation: "fadeIn 1s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3>Processed Video</h3>
          <video
            key={videoUrl} // React re-renders the video element when URL changes
            controls
            style={{ width: "80%", maxWidth: "600px", borderRadius: "10px" }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <button
              onClick={handleDownloadVideo}
              style={{
                padding: "10px 20px",
                fontSize: "1em",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "transform 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
            >
              Download Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
