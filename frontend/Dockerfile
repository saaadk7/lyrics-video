# Frontend Dockerfile

# Base image
FROM node:18 as builder

# Set working directory
WORKDIR /app/frontend

# Copy frontend dependencies and install
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code and build
COPY frontend/ .
RUN npm run build

# Serve the frontend using Nginx
FROM nginx:alpine
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

