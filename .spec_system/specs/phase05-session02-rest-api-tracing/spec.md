# Session Specification

**Session ID**: `phase05-session02-rest-api-tracing`
**Phase**: 05 - AI Observability (Langfuse)
**Status**: Validated
**Created**: 2025-12-22

---

## 1. Session Overview

This session implements comprehensive tracing for the REST API layer, specifically the `/api/gemini/grounding` endpoint. Building on the Langfuse infrastructure deployed in Session 01, we now instrument actual AI calls to capture traces, token usage, latency metrics, and cost data.

The Gemini grounding endpoint is the synchronous REST call used for location-based queries with Google Maps integration. By tracing this endpoint first, we establish patterns and utilities that will be reused for the more complex WebSocket voice session tracing in Session 03.

This session delivers the core observability value proposition: the ability to see every AI request, understand its cost, measure latency, and debug issues through the Langfuse dashboard. Without this tracing layer, we would be flying blind on AI costs and performance characteristics.

---

## 2. Objectives

1. Create reusable Langfuse tracing middleware for Hono that automatically creates traces for API requests
2. Instrument the Gemini grounding endpoint with generation spans that capture input/output and token usage
3. Implement a cost calculation utility based on Gemini pricing that computes per-request costs
4. Correlate Langfuse trace IDs with Pino request logs for unified debugging across systems

---

## 3. Prerequisites

### Required Sessions
- [x] `phase05-session01-langfuse-setup` - Provides Langfuse Docker deployment, SDK installation, and `getLangfuse()` client wrapper

### Required Tools/Knowledge
- Langfuse SDK tracing API (`trace()`, `generation()`, `span()`)
- Hono middleware patterns
- Gemini API response structure (usageMetadata)

### Environment Requirements
- Langfuse running at `http://localhost:3016`
- Valid `LANGFUSE_SECRET_KEY` and `LANGFUSE_PUBLIC_KEY` in `.env.local`
- PostgreSQL and app services running via Docker Compose

---

## 4. Scope

### In Scope (MVP)
- Langfuse tracing middleware for Hono routes
- Gemini grounding endpoint instrumentation with generation spans
- Token usage extraction from Gemini `usageMetadata`
- Cost calculation utility with Gemini pricing
- Trace ID injection into Pino logger context
- Verification that traces appear in Langfuse dashboard

### Out of Scope (Deferred)
- WebSocket voice session tracing - *Reason: Session 03 scope*
- Cost aggregation endpoints - *Reason: Session 04 scope*
- User-level cost tracking - *Reason: Session 04 scope*
- Custom Langfuse dashboard views - *Reason: Use built-in dashboard*

---

## 5. Technical Approach

### Architecture

```
Request Flow with Tracing:

  Client Request
       |
       v
  [langfuseTrace middleware]  <-- Creates trace, sets context
       |
       v
  [gemini.post('/grounding')]
       |
       v
  [callGeminiApi()]  <-- Creates generation span
       |            <-- Records input/output/usage
       v
  [calculateCost()]  <-- Computes cost from tokens
       |
       v
  Response
       |
       v
  [trace.update()]  <-- Finalizes trace with status/duration
```

### Design Patterns
- **Middleware Pattern**: Automatic trace creation without polluting route handlers
- **Context Propagation**: Pass trace via Hono context (`c.set('trace', trace)`)
- **Graceful Degradation**: Continue if Langfuse unavailable (null client)
- **Singleton Cost Calculator**: Centralized pricing configuration

### Technology Stack
- Langfuse SDK v3.x
- Hono middleware API
- Pino logger with child context

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_middleware/langfuse-trace.ts` | Hono middleware for automatic trace creation | ~60 |
| `api/_lib/cost-calculator.ts` | Cost calculation utility with Gemini pricing | ~50 |
| `api/_lib/types/langfuse.ts` | TypeScript types for tracing context | ~30 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `api/_routes/gemini.ts` | Add generation span instrumentation | ~40 |
| `api/_lib/logger.ts` | Add trace ID injection helper | ~15 |
| `api/_lib/langfuse.ts` | Add helper exports (re-export types) | ~10 |
| `api/index.ts` | Apply tracing middleware to routes | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Tracing middleware creates traces for all API requests
- [ ] Generation spans capture Gemini input (prompt, location)
- [ ] Generation spans capture Gemini output (response text)
- [ ] Token usage recorded (promptTokenCount, candidatesTokenCount)
- [ ] Cost calculated and stored in generation usage
- [ ] Trace ID appears in Pino logs for correlation
- [ ] Traces visible in Langfuse dashboard at localhost:3016

### Testing Requirements
- [ ] Unit test for cost calculation utility
- [ ] Unit test for middleware trace creation
- [ ] Manual test: Make grounding request, verify trace in dashboard
- [ ] Manual test: Verify trace ID in application logs

### Quality Gates
- [ ] TypeScript strict mode passing (zero errors)
- [ ] ESLint passing (zero warnings)
- [ ] All existing tests pass
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings

---

## 8. Implementation Notes

### Key Considerations

**Trace Context Propagation**
The middleware must set the trace on Hono context before route handlers execute. Use `c.set('trace', trace)` and retrieve with `c.get('trace')`.

**Null Client Handling**
`getLangfuse()` returns `null` if Langfuse is not configured. All tracing code must handle this gracefully:
```typescript
const langfuse = getLangfuse();
if (!langfuse) return next(); // Skip tracing, continue request
```

**Token Usage Extraction**
Gemini API returns usage in `response.usageMetadata`:
```json
{
  "usageMetadata": {
    "promptTokenCount": 150,
    "candidatesTokenCount": 320,
    "totalTokenCount": 470
  }
}
```
Handle cases where `usageMetadata` is missing.

**Async Flush Timing**
Traces are flushed asynchronously. In development mode (`flushAt: 1, flushInterval: 100`), traces appear quickly. Production batches more aggressively.

### Potential Challenges
- **Missing usageMetadata**: Some Gemini responses may not include token counts. Use `0` as fallback and log a warning.
- **Middleware ordering**: Tracing middleware must run before route handlers. Verify middleware is applied first.
- **Error traces**: Errors should still create traces with error output. Wrap handler in try/catch.

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid Unicode characters in comments and strings.

---

## 9. Testing Strategy

### Unit Tests
- `cost-calculator.test.ts`: Test cost calculation for various token counts
  - Zero tokens returns zero cost
  - Known token counts return expected costs
  - Unknown model returns zero cost
- `langfuse-trace.test.ts`: Test middleware behavior
  - Creates trace when Langfuse configured
  - Skips gracefully when Langfuse not configured
  - Sets trace on context

### Integration Tests
- None required for this session (rely on manual testing)

### Manual Testing
1. Start Langfuse: `docker compose up langfuse-server langfuse-db`
2. Start app: `npm run dev`
3. Make grounding request via frontend or curl:
   ```bash
   curl -X POST http://localhost:5173/api/gemini/grounding \
     -H "Content-Type: application/json" \
     -d '{"prompt": "coffee shops", "lat": 37.7749, "lng": -122.4194}'
   ```
4. Open Langfuse dashboard: http://localhost:3016
5. Navigate to Traces, verify trace appears with:
   - Name: `POST /api/gemini/grounding`
   - Generation span: `gemini-grounding`
   - Input: prompt and location
   - Output: response
   - Usage: token counts and cost
6. Check application logs for trace ID correlation

### Edge Cases
- Request with missing location (lat/lng)
- Gemini API error response
- Langfuse unavailable (test graceful degradation)
- Very long prompts (verify no truncation issues)

---

## 10. Dependencies

### External Libraries
- `langfuse`: ^3.x (already installed in Session 01)

### Other Sessions
- **Depends on**: `phase05-session01-langfuse-setup`
- **Depended by**: `phase05-session03-websocket-tracing`, `phase05-session04-cost-tracking`

---

## 11. Code Specifications

### Middleware Signature

```typescript
// api/_middleware/langfuse-trace.ts
import type { MiddlewareHandler } from 'hono';

export const langfuseTrace: MiddlewareHandler = async (c, next) => {
  // Implementation
};
```

### Cost Calculator API

```typescript
// api/_lib/cost-calculator.ts
export interface GeminiPricing {
  input: number;  // cost per token
  output: number; // cost per token
}

export const GEMINI_PRICING: Record<string, GeminiPricing> = {
  'gemini-2.5-flash': {
    input: 0.075 / 1_000_000,   // $0.075 per 1M input tokens
    output: 0.30 / 1_000_000,   // $0.30 per 1M output tokens
  },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number;
```

### Context Types

```typescript
// api/_lib/types/langfuse.ts
import type { LangfuseTraceClient } from 'langfuse';

declare module 'hono' {
  interface ContextVariableMap {
    trace: LangfuseTraceClient | null;
    traceId: string | null;
  }
}
```

### Generation Span Pattern

```typescript
// In gemini.ts route handler
const trace = c.get('trace');
if (trace) {
  const generation = trace.generation({
    name: 'gemini-grounding',
    model: 'gemini-2.5-flash',
    input: { prompt, lat, lng },
    modelParameters: { /* any params */ },
  });

  // ... make API call ...

  generation.end({
    output: responseData,
    usage: {
      input: usageMetadata?.promptTokenCount ?? 0,
      output: usageMetadata?.candidatesTokenCount ?? 0,
      totalCost: calculateCost(model, inputTokens, outputTokens),
    },
  });
}
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
