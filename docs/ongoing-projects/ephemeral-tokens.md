# Ephemeral Tokens Implementation Plan

**Status**: In Progress
**Created**: 2025-12-18
**Priority**: Critical (Security)

---

## Problem Statement

The frontend JavaScript crashes on Vercel with:

```
Uncaught Error: Missing required environment variable: GEMINI_API_KEY
```

### Root Cause Analysis

1. **Vite's Security Model**: Only `VITE_` prefixed env vars are exposed to browser bundles
2. **Current Setup**: `GEMINI_API_KEY` is set in Vercel (server-side only), but frontend needs it for Live API
3. **Naive Fix (REJECTED)**: Adding `VITE_GEMINI_API_KEY` would expose the API key in the browser bundle

### Why Exposing API Keys is Dangerous

Google explicitly warns: _"Never expose API keys on the client-side. Keys in client-side code can be extracted."_

- HTTP referrer restrictions can be spoofed
- Keys in JS bundles can be extracted via browser DevTools
- Anyone can use curl/Postman with your key
- Referrer restrictions only stop casual misuse, not attackers

---

## Solution: Ephemeral Tokens (Google Recommended)

Google provides **ephemeral tokens** specifically for the Live API. This is the proper secure approach.

### Architecture

```
┌─────────────┐     1. Request token       ┌─────────────────┐
│   Browser   │ ─────────────────────────► │  Your Backend   │
│  (Frontend) │                            │ (has API key)   │
│             │  2. Short-lived token      │                 │
│             │ ◄───────────────────────── │ /api/live/token │
│             │                            └─────────────────┘
│             │  3. Connect with token     ┌─────────────────┐
│             │ ─────────────────────────► │  Google Live    │
└─────────────┘                            │      API        │
                                           └─────────────────┘
```

### Token Properties

| Property               | Default | Description           |
| ---------------------- | ------- | --------------------- |
| `uses`                 | 1       | Single-use token      |
| `expireTime`           | 30 min  | Max session duration  |
| `newSessionExpireTime` | 1 min   | Time to start session |

### Security Benefits

- API key NEVER leaves your server
- Tokens expire quickly (1 min to start, 30 min max)
- Single-use prevents replay attacks
- Can be locked to specific model/config

---

## Implementation Plan

### Phase 1: Backend Endpoint

**File**: `api/[[...route]].ts`

Add new endpoint `POST /api/live/token` that:

1. Validates request (optional: add auth if needed later)
2. Creates ephemeral token using `@google/genai` SDK
3. Returns token to client

```typescript
// Pseudocode for /api/live/token
import { GoogleGenAI } from '@google/genai';

async function handleLiveToken(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse(res, 'MISSING_API_KEY', 'Server not configured', 500);
  }

  const client = new GoogleGenAI({ apiKey });

  const expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000); // 2 min

  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: expireTime.toISOString(),
      newSessionExpireTime: newSessionExpireTime.toISOString(),
      httpOptions: { apiVersion: 'v1alpha' },
    },
  });

  return jsonResponse(res, {
    token: token.name,
    expiresAt: expireTime.toISOString(),
  });
}
```

**Route Addition**:

```typescript
if (path.includes('/api/live/token') && method === 'POST') {
  return handleLiveToken(req, res);
}
```

### Phase 2: Frontend Token Fetching

**File**: `src/lib/api/token-service.ts` (NEW)

```typescript
export interface TokenResponse {
  token: string;
  expiresAt: string;
}

export async function fetchLiveToken(): Promise<TokenResponse> {
  const response = await fetch('/api/live/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch token: ${response.status}`);
  }

  return response.json();
}
```

### Phase 3: Update GenAILiveClient

**File**: `src/lib/api/genai-live-client.ts`

Change constructor to accept token instead of API key:

```typescript
// Before
constructor(apiKey: string, model?: string) {
  this.client = new GoogleGenAI({ apiKey });
}

// After
constructor(token: string, model?: string) {
  // Token is used like an API key but is short-lived
  this.client = new GoogleGenAI({ apiKey: token });
}
```

### Phase 4: Update LiveAPIContext

**File**: `src/contexts/LiveAPIContext.tsx`

Remove `apiKey` prop, add token fetching:

```typescript
// Before
export interface LiveAPIProviderProps {
  apiKey: string; // REMOVE THIS
  // ...
}

// After
export interface LiveAPIProviderProps {
  // apiKey removed - we fetch tokens on demand
  // ...
}
```

### Phase 5: Update useLiveApi Hook

**File**: `src/hooks/use-live-api.ts`

Modify `connect()` to fetch token first:

```typescript
const connect = useCallback(async () => {
  // 1. Fetch fresh token from backend
  const { token } = await fetchLiveToken();

  // 2. Create new client with token
  const tokenClient = new GenAILiveClient(token, model);

  // 3. Connect using token
  await tokenClient.connect(config);
}, [config, model]);
```

### Phase 6: Update App.tsx

**File**: `src/App.tsx`

Remove GEMINI_API_KEY requirement:

```typescript
// Before
const GEMINI_API_KEY = getRequiredEnvVar('GEMINI_API_KEY');

// After
// GEMINI_API_KEY removed - tokens fetched on demand from backend
```

Keep GOOGLE_MAPS_API_KEY (Maps SDK always needs client-side key with referrer restrictions).

### Phase 7: Update vite.config.ts

**File**: `vite.config.ts`

Remove GEMINI_API_KEY injection:

```typescript
// Before
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
  'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(mapsApiKey),
}

// After
define: {
  // GEMINI_API_KEY removed - not needed client-side
  'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(mapsApiKey),
}
```

### Phase 8: Update Environment Variables

**Vercel Environment Variables (Final State)**:

| Variable                   | Purpose                  | Required |
| -------------------------- | ------------------------ | -------- |
| `GEMINI_API_KEY`           | Backend token generation | Yes      |
| `GOOGLE_MAPS_API_KEY`      | Backend API proxy        | Yes      |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend Maps SDK        | Yes      |

**NOT needed anymore**:

- `VITE_GEMINI_API_KEY` - tokens replace this

---

## Files to Modify

| File                               | Action       | Changes                           |
| ---------------------------------- | ------------ | --------------------------------- |
| `api/[[...route]].ts`              | Modify       | Add `/api/live/token` endpoint    |
| `src/lib/api/token-service.ts`     | Create       | Token fetching utility            |
| `src/lib/api/genai-live-client.ts` | Modify       | Accept token in constructor       |
| `src/contexts/LiveAPIContext.tsx`  | Modify       | Remove apiKey prop                |
| `src/hooks/use-live-api.ts`        | Modify       | Fetch token before connect        |
| `src/App.tsx`                      | Modify       | Remove GEMINI_API_KEY requirement |
| `vite.config.ts`                   | Modify       | Remove GEMINI_API_KEY injection   |
| `package.json`                     | Already done | Upgraded @google/genai to 1.34.0  |

---

## Testing Plan

### Local Testing

1. Start API server: `npm run api:dev`
2. Start frontend: `npm run dev`
3. Test token endpoint: `curl -X POST http://localhost:3001/api/live/token`
4. Verify token is returned with expiration
5. Test voice conversation works end-to-end

### Vercel Testing

1. Deploy to Vercel
2. Verify `/api/live/token` returns token
3. Test voice conversation on production URL
4. Verify no API keys visible in browser DevTools Network tab

---

## Rollback Plan

If issues arise:

1. Revert to VITE_GEMINI_API_KEY approach (less secure but functional)
2. Add HTTP referrer restrictions in Google Cloud Console
3. Set quota limits on the API key

---

## References

- [Ephemeral tokens | Gemini API](https://ai.google.dev/gemini-api/docs/ephemeral-tokens)
- [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [GitHub Issue: How to protect Gemini API key?](https://github.com/google-gemini/live-api-web-console/issues/44)
- [@google/genai npm package](https://www.npmjs.com/package/@google/genai)

---

## Progress Tracking

- [x] Research ephemeral tokens approach
- [x] Upgrade @google/genai to 1.34.0
- [x] Create /api/live/token endpoint
- [x] Create token-service.ts utility
- [x] Update GenAILiveClient
- [x] Update LiveAPIContext
- [x] Update useLiveApi hook
- [x] Update App.tsx
- [x] Update vite.config.ts
- [x] Test locally (typecheck, lint, tests pass)
- [ ] Deploy and test on Vercel
