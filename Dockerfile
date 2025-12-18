# Multi-stage Docker build for Chat with Google Maps API

# Stage 1: Production stage
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only, skip prepare script (husky)
RUN npm ci --omit=dev --ignore-scripts && npm install tsx

# Copy API source code
COPY api/ ./api/

# Expose API port
EXPOSE 3011

# Set environment variables
ENV NODE_ENV=production
ENV API_PORT=3011

# Run API server using tsx
CMD ["npx", "tsx", "api/_adapters/node.ts"]
