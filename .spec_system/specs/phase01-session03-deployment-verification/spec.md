# Session Specification

**Session ID**: `phase01-session03-deployment-verification`
**Phase**: 01 - Backend API Layer (Hono)
**Status**: Not Started
**Created**: 2025-12-17
**Updated**: 2025-12-17 (aligned with deployment philosophy from Session 04)

---

## 1. Session Overview

This session completes Phase 01 by ensuring the Hono backend deploys correctly to multiple platforms and creating Docker configuration for self-hosted deployment. The codebase should work on Vercel (for convenience) AND be fully self-hostable via Docker.

The current implementation uses `@hono/node-server` for local development. For production, we support two deployment paths:
1. **Vercel** - Quick setup, serverless, zero infrastructure management
2. **Docker** - Self-hosted, full control, any infrastructure

Upon completion, the project will have a production-verified API layer with health, Gemini proxy, and Maps proxy endpoints working in both Vercel and Docker deployments. The deployment-agnostic architecture ensures the same codebase deploys everywhere without modification.

---

## 2. Objectives

1. Refactor Hono app for platform-agnostic deployment (pure app.ts with adapters)
2. Configure Vercel serverless deployment with proper entry point
3. Create Docker configuration for self-hosted deployment
4. Verify all API endpoints work in both deployment environments
5. Document multi-platform deployment options

---

## 3. Prerequisites

### Required Sessions
- [x] `phase01-session01-hono-setup` - Hono framework configured with health endpoint
- [x] `phase01-session02-api-key-protection` - Gemini and Maps proxy routes implemented
- [x] `phase01-session04-prd-deployment-philosophy` - Deployment philosophy documented

### Required Tools/Knowledge
- Vercel CLI (`npm install -g vercel`) or Vercel dashboard access
- Docker installed locally (`docker --version`)
- Production API keys (GEMINI_API_KEY, GOOGLE_MAPS_API_KEY)

### Environment Requirements
- Access to Vercel dashboard or CLI for deployment
- Docker and Docker Compose for local self-hosted testing
- Production environment variables set in both environments

---

## 4. Scope

### In Scope (MVP)
- Refactor api/index.ts into pure app.ts with platform adapters
- Create Vercel-compatible API entry point (`api/[[...route]].ts`)
- Update `vercel.json` with API function routing
- Create `Dockerfile` for self-hosted API server
- Create `docker-compose.yml` for self-hosted deployment
- Verify API routes work in both Vercel and Docker deployments
- Test health check, Gemini proxy, and Maps proxy in production
- Document environment variable setup for both platforms
- Document multi-platform deployment options

### Out of Scope (Deferred)
- Kubernetes configuration - *Reason: Future enhancement*
- CI/CD pipeline setup - *Reason: Future consideration*
- Custom domain configuration - *Reason: Platforms auto-provide domains*
- SSL/TLS certificate setup - *Reason: Documented but not implemented*
- Cloudflare Workers/AWS Lambda - *Reason: Documentation only, implementation deferred*

---

## 5. Technical Approach

### Architecture: Deployment-Agnostic Pattern

```
api/
  app.ts              # Pure Hono app (routes, middleware) - NO platform code
  index.ts            # Development entry point (imports app, serves locally)
  adapters/
    node.ts           # @hono/node-server for local dev
    vercel.ts         # Vercel serverless export
  [[...route]].ts     # Vercel catch-all entry point

Dockerfile            # Self-hosted container build
docker-compose.yml    # Self-hosted orchestration
```

The same `app.ts` deploys everywhere - only the adapter changes.

### Design Patterns
- **Adapter Pattern**: Platform-specific entry points wrap the pure Hono app
- **Catch-all Route**: `[[...route]].ts` for flexible Vercel API routing
- **Multi-stage Docker Build**: Separate build and runtime stages for smaller images

### Technology Stack
- Hono v4.x (already installed)
- Vercel Serverless Functions (Node.js runtime)
- Docker with Node.js 20 Alpine

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/app.ts` | Pure Hono app (routes, middleware only) | ~50 |
| `api/adapters/node.ts` | Node.js server adapter for local dev | ~15 |
| `api/adapters/vercel.ts` | Vercel serverless export adapter | ~10 |
| `api/[[...route]].ts` | Vercel catch-all entry point | ~5 |
| `Dockerfile` | Self-hosted API container | ~20 |
| `docker-compose.yml` | Self-hosted orchestration | ~15 |
| `.dockerignore` | Exclude files from Docker build | ~10 |
| `docs/deployment.md` | Multi-platform deployment guide | ~150 |

### Files to Modify
| File | Changes | Est. Lines Delta |
|------|---------|------------------|
| `api/index.ts` | Simplify to dev entry point | -20 |
| `vercel.json` | Add API function routing | +5 |
| `package.json` | Add api:dev and build:api scripts | +5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `vercel --prod` deployment completes without errors
- [ ] `docker compose up` starts API successfully
- [ ] `GET /api/health` returns 200 on Vercel production
- [ ] `GET /api/health` returns 200 on Docker deployment
- [ ] `POST /api/gemini/generate-content` works on Vercel
- [ ] `POST /api/gemini/generate-content` works on Docker
- [ ] `GET /api/maps/places/search` works on Vercel
- [ ] `GET /api/maps/places/search` works on Docker
- [ ] Frontend continues to work (SPA routing intact)
- [ ] API keys are NOT exposed in browser network requests

### Testing Requirements
- [ ] Manual testing of all endpoints on Vercel
- [ ] Manual testing of all endpoints via Docker
- [ ] Verify no CORS issues between frontend and API
- [ ] Verify environment variables are accessible in both environments

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] Code passes `npm run quality` before deployment
- [ ] Docker image builds successfully

---

## 8. Implementation Notes

### Vercel Configuration
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Docker Configuration
```dockerfile
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
EXPOSE 3001
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
```

### Potential Challenges
- **Route Conflict**: Ensure `/api/*` routes don't conflict with SPA rewrite. Solution: Order rewrites with API first
- **Cold Start**: Vercel serverless cold start is acceptable for MVP
- **Docker Build**: Ensure build:api script produces correct output structure

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- Existing unit tests for API routes should continue to pass locally

### Integration Tests
- Not in scope for this session (local integration tests exist)

### Manual Testing - Vercel
1. Deploy to Vercel: `vercel --prod --yes`
2. Test health endpoint: `curl https://<domain>/api/health`
3. Test Gemini proxy: Use frontend to initiate voice conversation
4. Test Maps proxy: Use frontend to search for places
5. Verify frontend loads and map renders

### Manual Testing - Docker
1. Build and run: `docker compose up --build`
2. Test health endpoint: `curl http://localhost:3001/api/health`
3. Test Gemini proxy: POST to localhost:3001/api/gemini/generate-content
4. Test Maps proxy: GET localhost:3001/api/maps/places/search

### Edge Cases
- Empty response handling from external APIs
- Rate limiting from Google APIs
- Missing environment variables (should return clear error)

---

## 10. Dependencies

### External Libraries
- `hono`: ^4.11.1 (already installed)
- `@hono/node-server`: (already installed)
- No new dependencies required

### External Services
- Vercel (deployment platform)
- Docker (local container runtime)
- Google Gemini API (proxied via /api/gemini)
- Google Maps API (proxied via /api/maps)

### Other Sessions
- **Depends on**: phase01-session01-hono-setup, phase01-session02-api-key-protection
- **Depended by**: Phase 02 (Database Layer) - needs verified production environment

---

## Next Steps

Run `/tasks` to view the implementation task checklist.
