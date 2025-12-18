# Session 03: Deployment Verification

**Session ID**: `phase01-session03-deployment-verification`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 3-4 hours

---

## Objective

Verify deployment works across multiple platforms and create Docker configuration for self-hosted production deployment. The codebase should work on Vercel (for convenience) AND be fully self-hostable via Docker.

---

## Scope

### In Scope (MVP)
- Configure Vercel for Hono serverless functions
- Create `vercel.json` configuration if needed
- Verify API routes work in Vercel deployment
- Test health check endpoint in production
- Test Gemini proxy in production
- Test Maps proxy in production
- Document environment variable setup for Vercel
- Create `Dockerfile` for self-hosted API server
- Create `docker-compose.yml` for self-hosted deployment
- Document deployment options for multiple platforms

### Out of Scope
- Kubernetes configuration (future enhancement)
- CI/CD pipeline setup (future consideration)
- Custom domain configuration
- SSL/TLS certificate setup (documented but not implemented)

---

## Prerequisites

- [ ] Session 02 complete (API key protection working locally)
- [ ] Vercel account configured
- [ ] Docker installed locally (for self-hosted testing)
- [ ] Access to production environment variables

---

## Deliverables

1. `vercel.json` - Vercel configuration (if needed)
2. `Dockerfile` - API server container for self-hosting
3. `docker-compose.yml` - Self-hosted deployment configuration
4. `/docs/deployment.md` - Multi-platform deployment documentation
5. Verified Vercel deployment
6. Verified Docker deployment locally
7. Environment variable setup documentation
8. Troubleshooting guide for common deployment issues

---

## Technical Details

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

### Vercel Function Structure
```
api/
├── index.ts          # Exports Hono app as default
└── [[...route]].ts   # Catch-all route (if needed)
```

### Environment Variables on Vercel
```bash
# Set via Vercel dashboard or CLI
vercel env add GEMINI_API_KEY
vercel env add GOOGLE_MAPS_API_KEY
```

### Docker Configuration (Self-Hosted)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/api ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3011
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "3011:3001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
```

### Multi-Platform Deployment Options

```markdown
## Vercel (Quick Setup)
1. Connect GitHub repo to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push

## Docker Compose (Self-Hosted)
1. Clone repo to server
2. Create .env with API keys
3. Run: docker compose up -d

## Cloudflare Workers
1. Install wrangler: npm install -g wrangler
2. Create wrangler.toml with configuration
3. Deploy: wrangler deploy

## AWS Lambda
1. Use SST or Serverless Framework
2. Configure function handlers
3. Deploy: sst deploy

## Self-Hosted (Node.js/Bun)
1. Add serve script: node api/server.ts
2. Configure reverse proxy (nginx/caddy)
3. Set environment variables
```

---

## Success Criteria

- [ ] `vercel.json` configuration correct (if needed)
- [ ] Vercel deployment succeeds without errors
- [ ] `GET /api/health` works on Vercel
- [ ] Gemini API proxy works on Vercel
- [ ] Maps API proxy works on Vercel
- [ ] Environment variables properly configured on Vercel
- [ ] `Dockerfile` builds successfully
- [ ] `docker compose up` runs full stack locally
- [ ] API works via Docker deployment
- [ ] No API keys exposed in production network requests
- [ ] Multi-platform deployment documentation created
- [ ] Troubleshooting guide covers common issues
