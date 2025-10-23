# Use Node.js 18 as base image
FROM node:18-alpine

# Install Bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build:prod

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:railway"]
