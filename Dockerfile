FROM node:20 AS base

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.9.0

# Build backend
FROM base AS backend-builder

WORKDIR /app

# Copy server package files first
COPY server/package*.json server/pnpm-lock.yaml ./server/
WORKDIR /app/server
RUN pnpm install --frozen-lockfile

# Copy server source and build
COPY server/ ./
RUN pnpm run build

# Production image
FROM base AS runner

WORKDIR /app

# Copy server package.json and install production dependencies
COPY server/package*.json server/pnpm-lock.yaml ./

# Install deps
RUN pnpm install --frozen-lockfile --prod

# Copy built applications
COPY --from=backend-builder /app/server/dist ./dist

EXPOSE 8080

ENTRYPOINT ["node","dist/src/main.js"]
