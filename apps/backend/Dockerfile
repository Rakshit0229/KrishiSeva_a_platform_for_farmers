# ==========================================
# STAGE 1: Build & Compile TypeScript
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Hardened Minimal Production Runner
# ==========================================
FROM node:22-alpine AS runner

# Security: Install dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled outputs from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/models/trained_weights ./dist/models/trained_weights

# Ensure non-root ownership
RUN chown -R node:node /app

# Security: Run as unprivileged non-root user
USER node

EXPOSE 4000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
