# PRD Phase 01: Backend API Layer (Hono)

**Status**: Not Started
**Sessions**: 3 (initial estimate)
**Estimated Duration**: 2-3 days

**Progress**: 0/3 sessions (0%)

---

## Overview

Add a lightweight backend API layer using Hono. This enables server-side API key protection, future authentication, and database access while remaining **vendor-neutral** (not locked to Vercel). Hono is a modern, ultrafast web framework that runs on any JavaScript runtime including Vercel, Cloudflare Workers, AWS Lambda, Deno Deploy, Bun, and Node.js.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | Hono Setup & Configuration | Not Started | ~20 | - |
| 02 | API Key Protection | Not Started | ~25 | - |
| 03 | Deployment Verification | Not Started | ~15 | - |

---

## Completed Sessions

[None yet]

---

## Upcoming Sessions

- Session 01: Hono Setup & Configuration

---

## Objectives

1. **Backend Foundation**: Set up Hono backend in `/api` directory with proper project structure
2. **Development Proxy**: Configure Vite to proxy API requests in development for seamless local development
3. **API Key Security**: Move sensitive API keys (Gemini, Maps) to server-side environment
4. **API Proxying**: Create API routes for Gemini and Maps that proxy requests securely
5. **Deployment Portability**: Verify deployment works on Vercel and document alternatives

---

## Prerequisites

- Phase 00 completed (Developer Tooling & Quality Foundation)
- All quality gates passing (TypeScript, ESLint, Prettier, tests, pre-commit hooks)

---

## Technical Considerations

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment (Vercel/etc)                   │
├─────────────────────────┬───────────────────────────────────┤
│   Static Assets (CDN)   │   Serverless Functions            │
│                         │                                   │
│   React + Vite App      │   /api/* → Hono                   │
│   (no API keys)         │     ├── /api/health               │
│                         │     ├── /api/gemini/* → Gemini    │
│                         │     └── /api/maps/* → Google Maps │
└─────────────────────────┴───────────────────────────────────┘
```

### Why Hono

| Feature | Benefit |
|---------|---------|
| **Vendor Neutral** | Runs on Vercel, Cloudflare Workers, AWS Lambda, Deno Deploy, Bun, Node.js |
| **Web Standards** | Uses standard Request/Response objects (portable code) |
| **Zero Config on Vercel** | Native support since Aug 2024, Fluid Compute benefits |
| **Lightweight** | ~14KB, minimal overhead |
| **TypeScript First** | Excellent type inference and RPC support |
| **Better Auth Integration** | Official example in Hono docs (needed for Phase 03) |

### Deployment Portability

```
┌─────────────────────────────────────────────────────────────┐
│                     Same Hono Code                          │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Vercel    │ Cloudflare  │ AWS Lambda  │   Self-Hosted    │
│  (current)  │   Workers   │             │   (Node/Bun)     │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ Zero config │ wrangler    │ SST/Serverless│ node/bun serve │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### Technologies
- Hono 4.x (web framework)
- Vite proxy configuration (development)
- Vercel serverless functions (deployment)

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
- [ ] Documentation for deploying to alternative platforms
- [ ] All quality gates still passing (TypeScript, ESLint, Prettier, tests)

---

## Dependencies

### Depends On
- Phase 00: Developer Tooling & Quality Foundation

### Enables
- Phase 02: Database Layer (PostgreSQL + Drizzle)
- Phase 03: Authentication (Better Auth)
