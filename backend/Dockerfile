# Use a Node.js base image
FROM node:18 as backend

# Set the working directory
WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY backend .

# Expose the backend port
EXPOSE 4000

# Run the backend server
CMD ["npm", "run", "start"]
