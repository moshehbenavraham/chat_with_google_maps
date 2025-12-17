# Task Checklist

**Session ID**: `phase01-session03-deployment-verification`
**Total Tasks**: 28
**Estimated Duration**: 6-8 hours
**Created**: 2025-12-17
**Updated**: 2025-12-17 (aligned with deployment philosophy from Session 04)

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0103]` = Session reference (Phase 01, Session 03)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 4 | 4 | 0 |
| Vercel Deployment | 5 | 5 | 0 |
| Docker Self-Hosting | 6 | 6 | 0 |
| Documentation | 5 | 5 | 0 |
| Testing | 5 | 5 | 0 |
| **Total** | **28** | **28** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0103] Verify prerequisites: run `npm run quality` passes
- [x] T002 [S0103] Verify Docker is installed locally (`docker --version`)
- [x] T003 [S0103] Create `api/adapters/` directory for platform-specific entry points

---

## Foundation (4 tasks)

Platform-agnostic core refactoring.

- [x] T004 [S0103] Create `api/app.ts` as the pure Hono app (no platform code)
- [x] T005 [S0103] Refactor `api/index.ts` to import from app.ts and conditionally serve
- [x] T006 [S0103] [P] Create `api/adapters/node.ts` for local dev with @hono/node-server
- [x] T007 [S0103] [P] Create `api/adapters/vercel.ts` for Vercel serverless export

---

## Vercel Deployment (5 tasks)

Vercel serverless configuration and verification.

- [x] T008 [S0103] Create `api/[[...route]].ts` catch-all route for Vercel
- [x] T009 [S0103] Update `vercel.json` with API routing (preserve SPA rewrite)
- [x] T010 [S0103] Update `package.json` scripts for local dev (`npm run api:dev`)
- [x] T011 [S0103] Verify Vercel environment variables are configured (GEMINI_API_KEY, GOOGLE_MAPS_API_KEY)
- [x] T012 [S0103] Deploy to Vercel and verify deployment succeeds

---

## Docker Self-Hosting (6 tasks)

Docker configuration for self-hosted deployment.

- [x] T013 [S0103] Create `Dockerfile` for API server container
- [x] T014 [S0103] Create `docker-compose.yml` for self-hosted deployment
- [x] T015 [S0103] Create `.dockerignore` to exclude unnecessary files
- [x] T016 [S0103] Add `build:api` script to package.json for Docker builds
- [x] T017 [S0103] Test Docker build locally (`docker build .`)
- [x] T018 [S0103] Test Docker Compose locally (`docker compose up`)

---

## Documentation (5 tasks)

Multi-platform deployment documentation.

- [x] T019 [S0103] [P] Create `docs/deployment.md` with deployment overview
- [x] T020 [S0103] [P] Add Vercel deployment section to deployment.md
- [x] T021 [S0103] [P] Add Docker self-hosted section to deployment.md
- [x] T022 [S0103] Add alternative platforms section (Cloudflare, AWS, Bun)
- [x] T023 [S0103] Add troubleshooting guide for common deployment issues

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T024 [S0103] Test `GET /api/health` on Vercel production
- [x] T025 [S0103] Test Gemini and Maps proxies on Vercel production
- [x] T026 [S0103] Test API endpoints via Docker deployment
- [x] T027 [S0103] Validate all files are ASCII-encoded
- [x] T028 [S0103] Create implementation-notes.md with session summary

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing (`npm run quality`)
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

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

### Parallelization Opportunities

- T006-T007: Platform adapters are independent
- T019-T021: Documentation sections are independent

### Dependencies

- T004-T005 must complete first (core refactor)
- T008-T009 depend on T007 (vercel adapter)
- T013-T018 can run parallel to Vercel tasks
- T024-T026 require deployments to be ready

### Key Principles (from Session 04)

1. **No Lock-in**: Same codebase deploys everywhere
2. **Multiple Options**: Vercel for convenience, Docker for self-hosting
3. **Self-Hosting Ready**: Full control when needed
4. **Balanced Messaging**: "Vercel works now, Docker available when needed"

### Docker Configuration Reference

```dockerfile
# Dockerfile (from PRD)
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
# docker-compose.yml (from PRD)
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

---

## Next Steps

Run `/implement` to begin AI-led implementation.
