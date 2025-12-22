# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-22
**Project State**: Phase 05 - AI Observability (Langfuse)
**Completed Sessions**: 23

---

## Recommended Next Session

**Session ID**: `phase05-session02-rest-api-tracing`
**Session Name**: REST API Tracing (Gemini Grounding)
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: 20-25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (Langfuse Docker deployment and client wrapper)
- [x] Langfuse UI accessible at localhost:3001
- [x] Langfuse SDK installed and configured
- [x] Gemini grounding endpoint operational (`/api/gemini/grounding`)

### Dependencies
- **Builds on**: phase05-session01-langfuse-setup (completed)
- **Enables**: phase05-session03-websocket-tracing (voice session tracing)

### Project Progression

Session 02 is the natural next step in the observability implementation sequence. With Langfuse infrastructure deployed and the client wrapper ready (Session 01), we can now instrument the REST API layer. This follows a logical progression:

1. **Infrastructure** (Session 01) - Deploy Langfuse, create client wrapper
2. **REST Tracing** (Session 02) - Instrument synchronous API calls (simpler)
3. **WebSocket Tracing** (Session 03) - Instrument real-time voice sessions (complex)
4. **Cost Dashboard** (Session 04) - Aggregate data and create visibility tools

Starting with REST API tracing allows us to validate the tracing pipeline with simpler synchronous calls before tackling the complexity of WebSocket streaming sessions.

---

## Session Overview

### Objective

Instrument the `/api/gemini/grounding` endpoint with full Langfuse tracing including token usage, latency metrics, and cost tracking per request.

### Key Deliverables
1. **Langfuse tracing middleware** - Reusable Hono middleware for automatic trace creation
2. **Instrumented Gemini endpoint** - Generation spans with input/output tracking
3. **Token usage tracking** - Capture promptTokenCount and candidatesTokenCount
4. **Cost calculation utility** - Calculate costs based on Gemini pricing ($0.075/1M input, $0.30/1M output)
5. **Trace ID correlation** - Link Langfuse traces with Pino request logs
6. **Dashboard verification** - Confirm traces appear correctly in Langfuse UI

### Scope Summary
- **In Scope (MVP)**: REST endpoint tracing, token usage, cost calculation, Pino correlation
- **Out of Scope**: WebSocket tracing (Session 03), cost aggregation dashboard (Session 04)

---

## Technical Considerations

### Technologies/Patterns
- Langfuse SDK `trace()` and `generation()` APIs
- Hono middleware pattern for automatic trace context
- Gemini `usageMetadata` for token counts
- Pino logger integration via trace ID injection

### Potential Challenges
- **Token counting accuracy**: Gemini's `usageMetadata` may not always be present; need fallback handling
- **Trace context propagation**: Ensuring trace is available throughout request lifecycle
- **Cost calculation precision**: Gemini pricing may change; should be configurable
- **Async flush timing**: Traces must flush before response completes for accurate latency

### Files Likely Affected
- `api/_lib/langfuse.ts` (extend for tracing utilities)
- `api/_middleware/langfuse-trace.ts` (new file)
- `api/_lib/cost-calculator.ts` (new file)
- `api/_routes/gemini.ts` (instrument generation calls)
- `api/_lib/logger.ts` (add trace ID injection)

---

## Alternative Sessions

If this session is blocked:
1. **phase05-session03-websocket-tracing** - Only if REST endpoint is unavailable (not recommended - breaks logical order)
2. **Return to Phase 04 polish** - If Langfuse connectivity issues require debugging

Note: Session 03 and 04 have strict dependencies on Session 02, so this session should be prioritized.

---

## Next Steps

Run `/sessionspec` to generate the formal specification for phase05-session02-rest-api-tracing.
