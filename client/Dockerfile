# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Clean install of dependencies
RUN npm ci

# Copy the application source files
COPY . .

# Compile Vite production assets
RUN npm run build

# Stage 2: Serve the compiled assets using Nginx
FROM nginx:alpine

# Copy our custom Nginx config for routing and proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build artifacts from the build stage to Nginx serve folder
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]