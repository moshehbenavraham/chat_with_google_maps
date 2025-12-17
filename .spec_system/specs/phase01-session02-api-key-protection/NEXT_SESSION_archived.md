# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-17
**Project State**: Phase 01 - Backend API Layer (Hono)
**Completed Sessions**: 6

---

## Recommended Next Session

**Session ID**: `phase01-session02-api-key-protection`
**Session Name**: API Key Protection
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 complete (Hono setup working)
- [x] Health endpoint operational (`GET /api/health`)
- [x] Vite dev server proxy configured for `/api/*`
- [x] Vercel deployment verified

### Dependencies
- **Builds on**: phase01-session01-hono-setup (Hono backend infrastructure)
- **Enables**: phase01-session03-deployment-verification (production deployment)

### Project Progression
API Key Protection is the logical next step because:
1. **Security Priority**: Sensitive API keys (Gemini, Google Maps) are currently exposed on the client-side with `VITE_` prefixes. This is a critical security issue that must be addressed before any production deployment.
2. **Foundation Ready**: The Hono backend from Session 01 provides the infrastructure needed to create secure proxy routes.
3. **Blocking Dependency**: Session 03 (Deployment Verification) explicitly requires Session 02 to be complete - it needs the proxy routes to test in production.
4. **MVP Sequence**: The natural build order is setup → security → deployment.

---

## Session Overview

### Objective
Move sensitive API keys (Gemini, Google Maps) to server-side environment and create proxy routes to access external APIs securely.

### Key Deliverables
1. `/api/routes/gemini.ts` - Gemini API proxy routes
2. `/api/routes/maps.ts` - Google Maps API proxy routes
3. `/api/middleware/error-handler.ts` - Error handling middleware
4. Updated `.env.example` - Server-side environment variables
5. Updated React client - Use proxied API endpoints
6. Environment variable documentation

### Scope Summary
- **In Scope (MVP)**: Move API keys to server-side, create proxy routes for Gemini and Maps APIs, update client code, add error handling and request validation
- **Out of Scope**: WebSocket/streaming support, caching layer, user-specific API quotas, deployment configuration

---

## Technical Considerations

### Technologies/Patterns
- Hono route handlers for API proxying
- Environment variable management (dotenv)
- HTTP client for external API calls (native fetch)
- Error handling middleware pattern
- TypeScript interfaces for request/response types

### Potential Challenges
- **Gemini API complexity**: May need to handle multiple endpoint patterns (generate, chat, embeddings)
- **Maps API diversity**: Google Maps has many endpoints (Places, Geocoding, Directions) - need to determine which to proxy initially
- **Request/response transformation**: May need to transform headers and body formats between client and external APIs
- **Error propagation**: Need consistent error format that doesn't leak sensitive information

---

## Alternative Sessions

If this session is blocked:
1. **Phase 02 preparation** - Begin researching PostgreSQL + Drizzle setup (read-only exploration, no implementation)
2. **Documentation tasks** - Improve existing project documentation while waiting

Note: Session 03 (Deployment Verification) is NOT an alternative as it has an explicit dependency on Session 02.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
