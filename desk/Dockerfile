# Build stage
FROM oven/bun:1 AS builder

# Install git-lfs to fetch large files
RUN apt-get update && apt-get install -y git-lfs && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files (including .git for LFS)
COPY . .

# Fetch actual LFS files (replaces pointer files with real content)
RUN git lfs install && git lfs pull

# Build args for Vite environment variables
ARG VITE_BLOG_API_URL
ENV VITE_BLOG_API_URL=$VITE_BLOG_API_URL

# Build the app
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
