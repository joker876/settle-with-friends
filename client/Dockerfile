# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy client package files
COPY client/package*.json client/pnpm-lock.yaml ./client/

# Install pnpm globally
RUN npm install -g pnpm@10.9.0

# Install dependencies
WORKDIR /app/client
RUN pnpm install --frozen-lockfile

# Copy client source code
COPY client/ ./

# Copy shared types from server (if needed by client)
COPY server/shared/ ../server/shared/

# Build the Angular application for production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Build based
RUN pnpm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built app from builder stage
# Angular outputs to dist/client/browser with the new build system
COPY --from=builder /app/client/dist/client/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY client/nginx.conf /etc/nginx/nginx.conf

# Expose port 85
EXPOSE 85

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
