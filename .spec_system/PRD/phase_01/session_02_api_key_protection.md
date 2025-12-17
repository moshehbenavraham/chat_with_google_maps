# Session 02: API Key Protection

**Session ID**: `phase01-session02-api-key-protection`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 3-4 hours

---

## Objective

Move sensitive API keys (Gemini, Google Maps) to server-side environment and create proxy routes to access external APIs securely.

---

## Scope

### In Scope (MVP)
- Move `GEMINI_API_KEY` to server-side only (remove `VITE_` prefix)
- Move `GOOGLE_MAPS_API_KEY` to server-side only
- Create `/api/gemini/*` proxy routes for Gemini API
- Create `/api/maps/*` proxy routes for Google Maps API
- Update React client to use proxied endpoints
- Add error handling for API proxy failures
- Configure environment variable loading in API
- Add request validation and rate limiting middleware

### Out of Scope
- WebSocket/streaming support for Gemini Live (future enhancement)
- Caching layer (future enhancement)
- User-specific API quotas (requires auth - Phase 03)
- Docker production configuration (Session 03)

---

## Prerequisites

- [ ] Session 01 complete (Hono setup working)
- [ ] Current API keys documented
- [ ] Understanding of Gemini API endpoints
- [ ] Understanding of Google Maps API endpoints

---

## Deliverables

1. `/api/routes/gemini.ts` - Gemini API proxy routes
2. `/api/routes/maps.ts` - Google Maps API proxy routes
3. `/api/middleware/error-handler.ts` - Error handling middleware
4. Updated `.env.example` - Server-side environment variables
5. Updated React client - Use proxied API endpoints
6. Environment variable documentation

---

## Technical Details

### Environment Variables (Server-Side)
```bash
# .env (server-side only, no VITE_ prefix)
GEMINI_API_KEY=your_gemini_key
GOOGLE_MAPS_API_KEY=your_maps_key
```

### Proxy Route Structure
```typescript
// /api/gemini/*
POST /api/gemini/generate    → generativelanguage.googleapis.com
POST /api/gemini/chat        → generativelanguage.googleapis.com

// /api/maps/*
GET /api/maps/places         → maps.googleapis.com/maps/api/place
GET /api/maps/geocode        → maps.googleapis.com/maps/api/geocode
```

### Client-Side Changes
```typescript
// Before (exposed key)
const response = await fetch(`https://api.gemini.com?key=${VITE_API_KEY}`);

// After (proxied, key hidden)
const response = await fetch('/api/gemini/generate', { method: 'POST', body });
```

### Error Response Format
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## Success Criteria

- [ ] `GEMINI_API_KEY` not accessible from browser (no VITE_ prefix)
- [ ] `GOOGLE_MAPS_API_KEY` not accessible from browser
- [ ] `/api/gemini/*` routes proxy to Gemini API correctly
- [ ] `/api/maps/*` routes proxy to Google Maps API correctly
- [ ] React client updated to use proxy endpoints
- [ ] Network tab shows no API keys in requests
- [ ] Error responses are consistent and informative
- [ ] All existing functionality works through proxy
- [ ] TypeScript types for API requests/responses
- [ ] Tests for proxy routes
