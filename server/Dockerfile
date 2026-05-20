# Use a lightweight official Node.js Alpine image for production
FROM node:24-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the server port
EXPOSE 5000

# Set environment variable to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run","start"]