# Multi-stage Dockerfile for NestJS app
# Builder stage: install dev deps and build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY . ./

RUN npm install --legacy-peer-deps
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
