FROM node:20-alpine
WORKDIR /app

# Disable Puppeteer/Chromium (not needed on Railway)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DISABLE_PUPPETEER=true
ENV NODE_ENV=production

# Copy package files from backend directory (build context = repo root)
COPY apps/backend/package*.json ./

# Install all deps (need devDeps for build)
RUN npm install --legacy-peer-deps

# Copy backend source
COPY apps/backend/ .

# Build NestJS
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/src/main"]
