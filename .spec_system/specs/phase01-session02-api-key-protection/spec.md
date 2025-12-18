# Session Specification

**Session ID**: `phase01-session02-api-key-protection`
**Phase**: 01 - Backend API Layer (Hono)
**Status**: Not Started
**Created**: 2025-12-17

---

## 1. Session Overview

This session implements server-side API key protection by moving sensitive API keys from client-side environment variables to server-only configuration, and creating proxy routes to access external APIs securely.

Currently, both `GEMINI_API_KEY` and `GOOGLE_MAPS_API_KEY` are accessed via `process.env` in client code (`App.tsx`, `maps-grounding.ts`), which exposes them in the browser bundle. This is a critical security vulnerability that must be addressed before production deployment.

The session will create Hono proxy routes (`/api/gemini/*` and `/api/maps/*`) that handle external API communication server-side, keeping API keys hidden from browser network requests. The React client will be updated to call these proxy endpoints instead of directly accessing external APIs with exposed keys.

**Important Scope Note**: The Google Maps JavaScript API requires client-side API key loading (for `@vis.gl/react-google-maps`). This key cannot be fully hidden but will be restricted via Google Cloud Console settings. The Gemini Live WebSocket API also connects client-to-server directly. However, REST-based Gemini calls (maps grounding) will be proxied server-side.

---

## 2. Objectives

1. Move `GEMINI_API_KEY` to server-side only for REST API calls (maps grounding)
2. Create `/api/gemini/*` proxy routes for Gemini REST API endpoints
3. Create `/api/maps/*` proxy routes for Maps Grounding API
4. Update React client to use proxied endpoints instead of direct API calls
5. Implement consistent error handling middleware for all API routes
6. Document API key restrictions and security best practices

---

## 3. Prerequisites

### Required Sessions
- [x] `phase01-session01-hono-setup` - Provides Hono backend infrastructure, health endpoint, Vite dev proxy

### Required Tools/Knowledge
- Understanding of Hono route handlers and middleware
- Familiarity with the Gemini REST API (generativelanguage.googleapis.com)
- Understanding of Google Maps Grounding API

### Environment Requirements
- Node.js 18+ with native fetch support
- Existing `.env` file with `GEMINI_API_KEY` and `GOOGLE_MAPS_API_KEY`
- Vite dev server proxy configured for `/api/*`

---

## 4. Scope

### In Scope (MVP)
- Create `/api/gemini/grounding` route for Maps Grounding API calls
- Create `/api/maps/grounding` as alias (same endpoint, clearer naming)
- Move server-side API keys to non-VITE_ prefixed environment variables
- Update `src/lib/api/maps-grounding.ts` to call proxy endpoint
- Add error handling middleware with consistent error format
- Add request validation for proxy routes
- Update `.env.example` with server-side variable documentation
- Add environment variable loading in API server

### Out of Scope (Deferred)
- WebSocket proxy for Gemini Live API - *Reason: Requires significant architecture (WebSocket relay server), keep client-side with restrictions*
- Full Maps JavaScript API proxying - *Reason: JS API requires client-side key, use HTTP referrer restrictions instead*
- Rate limiting middleware - *Reason: Phase 03 will add user-based rate limiting with auth*
- Caching layer - *Reason: Future enhancement after auth is in place*

---

## 5. Technical Approach

### Architecture

```
Client (Browser)                    Server (Hono)                   External APIs
-----------------                   -------------                   -------------

[React App]                         [/api/gemini/grounding]  --->  [Gemini REST API]
    |                                      ^
    |  POST /api/gemini/grounding          |
    +------------------------------------->+
    |
    |  (VITE_GOOGLE_MAPS_API_KEY)    (restricted, referrer-locked)
    +--------------------------------------------->  [Maps JS API]
    |
[LiveAPIContext]
    |  (WebSocket - still client-side, restricted key)
    +--------------------------------------------->  [Gemini Live WS]
```

### Design Patterns
- **Proxy Pattern**: Server acts as intermediary, hiding API keys from client
- **Middleware Pattern**: Centralized error handling and request validation
- **Repository Pattern**: Encapsulate external API calls in dedicated service modules

### Technology Stack
- Hono 4.x (route handlers, middleware)
- Native fetch (HTTP client for external APIs)
- TypeScript 5.x (strict mode)
- Vitest (unit testing)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/routes/gemini.ts` | Gemini API proxy routes | ~80 |
| `api/routes/maps.ts` | Maps API proxy routes | ~60 |
| `api/middleware/error-handler.ts` | Error handling middleware | ~50 |
| `api/middleware/validate-request.ts` | Request validation middleware | ~40 |
| `api/lib/env.ts` | Environment variable loading and validation | ~30 |
| `api/lib/errors.ts` | Custom error classes and types | ~40 |
| `api/__tests__/gemini.test.ts` | Tests for Gemini proxy routes | ~100 |
| `api/__tests__/maps.test.ts` | Tests for Maps proxy routes | ~80 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `api/index.ts` | Mount new routes and middleware | +15 |
| `src/lib/api/maps-grounding.ts` | Use proxy endpoint instead of direct API | +20/-15 |
| `.env.example` | Document server-side environment variables | +10 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `GEMINI_API_KEY` not exposed in browser network requests
- [ ] `POST /api/gemini/grounding` proxies to Gemini REST API correctly
- [ ] Maps grounding responses return correctly through proxy
- [ ] Error responses use consistent JSON format
- [ ] All existing maps grounding functionality works through proxy
- [ ] Environment variables validated at server startup

### Testing Requirements
- [ ] Unit tests for proxy routes (success and error cases)
- [ ] Unit tests for error handling middleware
- [ ] Manual testing: verify network tab shows no API keys
- [ ] Integration test: maps grounding works end-to-end

### Quality Gates
- [ ] All files ASCII-encoded (0-127)
- [ ] Unix LF line endings
- [ ] TypeScript strict mode - zero errors
- [ ] ESLint - zero warnings
- [ ] Prettier formatting applied
- [ ] All tests passing

---

## 8. Implementation Notes

### Key Considerations
- **Gemini Live WebSocket**: Cannot be proxied without WebSocket relay architecture. Keep client-side with HTTP referrer restrictions on the API key.
- **Maps JavaScript API**: Must remain client-side (library requirement). Restrict via referrer in Google Cloud Console.
- **Request Body Passthrough**: Proxy should forward request body to external API unchanged.
- **Response Passthrough**: Return external API response to client unchanged (except for error wrapping).
- **Timeout Handling**: Add reasonable timeout (30s) for external API calls.

### Potential Challenges
- **Gemini API Response Format**: Need to handle streaming vs non-streaming responses
- **Error Code Mapping**: Map external API errors to appropriate HTTP status codes
- **Request Size Limits**: May need to configure Hono body size limits

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No Unicode characters in code files.

---

## 9. Testing Strategy

### Unit Tests
- `gemini.test.ts`: Test proxy route handlers with mocked fetch
- `maps.test.ts`: Test maps proxy routes with mocked responses
- `error-handler.test.ts`: Test error middleware transforms errors correctly
- Mock external API calls - do not make real network requests in tests

### Integration Tests
- Test full request flow: client -> proxy -> (mocked) external API -> client
- Verify error handling chain works correctly

### Manual Testing
1. Start dev server (`npm run dev`)
2. Trigger maps grounding feature in UI
3. Open browser Network tab
4. Verify: No `GEMINI_API_KEY` visible in any request headers/URLs
5. Verify: Requests go to `/api/gemini/*` not directly to Google APIs
6. Verify: Responses return correctly and UI functions normally

### Edge Cases
- External API timeout (>30s)
- External API returns 4xx error
- External API returns 5xx error
- Malformed request body from client
- Missing environment variables at startup

---

## 10. Dependencies

### External Libraries
- `hono`: 4.x (already installed)
- `@hono/node-server`: (already installed)
- No new dependencies required

### Other Sessions
- **Depends on**: `phase01-session01-hono-setup` (Hono infrastructure)
- **Depended by**: `phase01-session03-deployment-verification` (needs proxy routes to test in production)

---

## API Endpoint Reference

### POST /api/gemini/grounding

Proxies maps grounding requests to Gemini REST API.

**Request:**
```typescript
interface GeminiGroundingRequest {
  prompt: string;
  enableWidget?: boolean;
  lat?: number;
  lng?: number;
  systemInstruction?: string;
}
```

**Response:**
```typescript
// On success: Gemini API response passthrough
interface GenerateContentResponse { ... }

// On error:
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request body
- `401`: API key not configured
- `502`: External API error
- `504`: External API timeout

---

## Environment Variables

### Server-Side Only (api/)
```bash
# Required - Gemini API for maps grounding
GEMINI_API_KEY=your-gemini-api-key

# Required - Google Maps for grounding tool config
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional - API server port
API_PORT=3011
```

### Client-Side (src/)
```bash
# Required - Maps JS API (restricted via HTTP referrers)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Required - Gemini Live WebSocket (restricted via HTTP referrers)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Security Note**: Client-side keys should have HTTP referrer restrictions configured in Google Cloud Console to prevent unauthorized usage.

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
