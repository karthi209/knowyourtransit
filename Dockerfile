# Use a Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Vite app (this will create the dist/ folder)
RUN npm run build

# Install a lightweight web server to serve the build
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 5174

# Start the app using serve
CMD ["serve", "-s", "dist", "-l", "5173"]