# Session 01: Hono Setup & Configuration

**Session ID**: `phase01-session01-hono-setup`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Install and configure Hono as the backend API framework with Vite development proxy and basic health check endpoint.

---

## Scope

### In Scope (MVP)
- Install `hono` package
- Create `/api` directory structure for backend code
- Create `/api/index.ts` with basic Hono app setup
- Configure Vite dev server proxy for `/api/*` requests
- Add health check endpoint (`GET /api/health`)
- Configure TypeScript for API directory
- Verify local development works with proxy
- Add npm scripts for API development

### Out of Scope
- API key protection (Session 02)
- Gemini/Maps proxy routes (Session 02)
- Docker production configuration (Session 03)
- Database connections (Phase 02)
- Authentication (Phase 03)

---

## Prerequisites

- [ ] Phase 00 complete (all quality gates passing)
- [ ] Understanding of Hono framework basics
- [ ] Vite development server working

---

## Deliverables

1. `/api/index.ts` - Main Hono application entry point
2. `/api/routes/health.ts` - Health check route
3. Updated `vite.config.ts` - Proxy configuration for development
4. Updated `package.json` - Hono dependency and scripts
5. Type definitions for API responses

---

## Technical Details

### Directory Structure
```
api/
├── index.ts          # Main Hono app, exports handler
├── routes/
│   └── health.ts     # Health check endpoint
└── lib/
    └── types.ts      # Shared API types
```

### Vite Proxy Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Health Check Response
```typescript
interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}
```

---

## Success Criteria

- [ ] `hono` package installed and in dependencies
- [ ] `/api/index.ts` exports valid Hono application
- [ ] `GET /api/health` returns JSON with status, timestamp, version
- [ ] Vite proxy forwards `/api/*` requests in development
- [ ] TypeScript compiles API code without errors
- [ ] ESLint passes on API code
- [ ] Local development workflow documented
