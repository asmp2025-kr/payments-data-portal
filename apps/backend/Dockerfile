FROM node:20-alpine
WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DISABLE_PUPPETEER=true
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Install production dependencies only (pre-built dist is copied from repo)
COPY apps/backend/package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy pre-built dist (committed to repo — no build step needed)
COPY apps/backend/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main"]
