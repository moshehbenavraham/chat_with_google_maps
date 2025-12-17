# PRD Phase 01: Backend API Layer (Hono)

**Status**: In Progress
**Sessions**: 4
**Estimated Duration**: 2-3 days

**Progress**: 3/4 sessions (75%)

---

## Overview

Add a lightweight backend API layer using Hono. This enables server-side API key protection, future authentication, and database access while remaining **fully deployment-agnostic**. The backend is designed to run identically in development (local Node.js) and production (self-hosted Docker).

**Deployment Philosophy**: This phase prioritizes self-hosting capability. Vercel/Cloudflare may be used for development convenience only—the production target is self-hosted infrastructure (Docker, VPS, bare metal).

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | Hono Setup & Configuration | Complete | 22 | 2025-12-17 |
| 02 | API Key Protection | Complete | 22 | 2025-12-17 |
| 03 | Deployment Verification | In Progress | 24 | - |
| 04 | PRD Deployment Philosophy | Complete | 18 | 2025-12-17 |

---

## Completed Sessions

- Session 01: Hono Setup & Configuration (2025-12-17)
- Session 02: API Key Protection (2025-12-17)
- Session 04: PRD Deployment Philosophy (2025-12-17)

---

## Upcoming Sessions

- Session 03: Deployment Verification (In Progress)

---

## Objectives

1. **Backend Foundation**: Set up Hono backend in `/api` directory with proper project structure
2. **Development Proxy**: Configure Vite to proxy API requests in development for seamless local development
3. **API Key Security**: Move sensitive API keys (Gemini, Maps) to server-side environment
4. **API Proxying**: Create API routes for Gemini and Maps that proxy requests securely
5. **Deployment Portability**: Verify deployment works on Vercel AND provide Docker for self-hosting

---

## Prerequisites

- Phase 00 completed (Developer Tooling & Quality Foundation)
- All quality gates passing (TypeScript, ESLint, Prettier, tests, pre-commit hooks)

---

## Technical Considerations

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment (Any Platform)                 │
├─────────────────────────┬───────────────────────────────────┤
│   Static Assets (CDN)   │   API Server (Hono)               │
│                         │                                   │
│   React + Vite App      │   /api/* → Hono                   │
│   (no API keys)         │     ├── /api/health               │
│                         │     ├── /api/gemini/* → Gemini    │
│                         │     └── /api/maps/* → Google Maps │
└─────────────────────────┴───────────────────────────────────┘

Development: Vite dev server with proxy
Production:  Vercel (convenience) OR Docker (self-hosted)
```

### Why Hono

| Feature | Benefit |
|---------|---------|
| **Vendor Neutral** | Runs on Vercel, Cloudflare Workers, AWS Lambda, Deno Deploy, Bun, Node.js |
| **Web Standards** | Uses standard Request/Response objects (portable code) |
| **Zero Config on Vercel** | Native support, works out of the box |
| **Lightweight** | ~14KB, minimal overhead |
| **TypeScript First** | Excellent type inference and RPC support |
| **Better Auth Integration** | Official example in Hono docs (needed for Phase 03) |

### Deployment Portability

```
┌─────────────────────────────────────────────────────────────┐
│                     Same Hono Code                          │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Vercel    │ Cloudflare  │ AWS Lambda  │   Self-Hosted    │
│             │   Workers   │             │   (Node/Bun)     │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ Zero config │ wrangler    │ SST/Serverless│ docker compose │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### Technologies
- Hono 4.x (web framework)
- Vite proxy configuration (development)
- Vercel serverless functions OR Docker (deployment options)

### Risks
- **Proxy Configuration**: Vite proxy may need careful configuration for WebSocket/streaming
  - Mitigation: Test Gemini Live streaming early in development
- **CORS Issues**: Cross-origin requests may fail if not properly configured
  - Mitigation: Add CORS middleware in Hono from the start
- **Cold Start Latency**: Serverless cold starts may affect first request
  - Mitigation: Keep functions lightweight, use Vercel Fluid Compute

---

## Success Criteria

Phase complete when:
- [ ] All 3 sessions completed
- [ ] Hono backend running at `/api/*` endpoints
- [ ] Health check endpoint responding (`GET /api/health`)
- [ ] API keys moved to server-side (not exposed in browser)
- [ ] Gemini API calls proxied through backend
- [ ] Maps API calls proxied through backend
- [ ] Works on Vercel deployment
- [ ] Docker configuration available for self-hosting
- [ ] Documentation for deploying to alternative platforms
- [ ] All quality gates still passing (TypeScript, ESLint, Prettier, tests)

---

## Dependencies

### Depends On
- Phase 00: Developer Tooling & Quality Foundation

### Enables
- Phase 02: Database Layer (PostgreSQL + Drizzle)
- Phase 03: Authentication (Better Auth)
