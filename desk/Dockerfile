# Build stage
FROM oven/bun:1 AS builder

# Install git and git-lfs
RUN apt-get update && apt-get install -y git git-lfs && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone repo with LFS files using Railway's git env vars
ARG RAILWAY_GIT_REPO_URL
ARG RAILWAY_GIT_COMMIT_SHA
RUN git lfs install && \
    git clone --depth 1 ${RAILWAY_GIT_REPO_URL} . && \
    git fetch --depth 1 origin ${RAILWAY_GIT_COMMIT_SHA} && \
    git checkout ${RAILWAY_GIT_COMMIT_SHA} && \
    git lfs pull

# Move into the desk subdirectory (since we cloned the whole repo)
WORKDIR /app/desk

# Install dependencies
RUN bun install --frozen-lockfile

# Build args for Vite environment variables
ARG VITE_BLOG_API_URL
ENV VITE_BLOG_API_URL=$VITE_BLOG_API_URL

# Build the app
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/desk/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY --from=builder /app/desk/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
