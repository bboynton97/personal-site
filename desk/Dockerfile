# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build args for Vite environment variables
ARG VITE_BLOG_API_URL
ARG VITE_BUCKET_URL
ENV VITE_BLOG_API_URL=$VITE_BLOG_API_URL
ENV VITE_BUCKET_URL=$VITE_BUCKET_URL

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
