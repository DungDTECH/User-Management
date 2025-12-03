# Multi-stage Dockerfile for NestJS app
# Builder stage: install dev deps and build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies + ts-node for migrations
RUN npm install --only=production --legacy-peer-deps && \
    npm install ts-node tsconfig-paths dotenv --legacy-peer-deps

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Copy source files needed for migrations
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/data-source.ts ./src/data-source.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Running migrations..."' >> /app/start.sh && \
    echo 'npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts' >> /app/start.sh && \
    echo 'echo "Migrations completed!"' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]
