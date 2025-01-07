const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const validateRoute = require("./routes/validate");
const downloadRoute = require("./routes/download");
const processRoute = require("./routes/process");

app.use("/api/validate-url", validateRoute);
app.use("/api/download", downloadRoute);
app.use("/api/process", processRoute);

// Serve frontend build
const frontendPath = path.join(__dirname, "../frontend/build");

if (process.env.NODE_ENV === "production" || fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // Catch-all for React routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
} else {
  console.warn("Frontend build not found. Backend running without frontend.");
}

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
