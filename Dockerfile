# Multi-stage Dockerfile for NestJS app
# Builder stage: install dev deps and build TypeScript
FROM node:18-alpine AS builder
WORKDIR /app

# Install build-time dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . ./
RUN npm run build

# Runner stage: install only production dependencies and run
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# If you rely on runtime files (views, public, env), copy them as needed
# COPY --from=builder /app/.env ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
