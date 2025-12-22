# Session Specification

**Session ID**: `phase05-session04-cost-tracking`
**Phase**: 05 - AI Observability (Langfuse)
**Status**: Not Started
**Created**: 2025-12-22

---

## 1. Session Overview

This session completes the AI Observability phase by implementing comprehensive cost tracking and operational monitoring for the Chat with Google Maps application. Building on the foundation established in sessions 01-03 (Langfuse setup, REST API tracing, WebSocket tracing), this session adds the financial visibility and operational resilience needed for production deployment.

The cost tracking system calculates and stores costs for all AI interactions including text-based REST API calls and voice-based WebSocket sessions (with audio pricing). Costs are stored in Langfuse generations, enabling analysis through the Langfuse dashboard and a custom aggregation endpoint. The observability routes provide health monitoring and cost analytics, while graceful degradation ensures the application continues functioning even when Langfuse is unavailable.

This is the final session of Phase 05. Upon completion, the project will have a fully self-hostable AI observability stack with trace correlation, cost tracking, latency monitoring, and operational health checks - all critical capabilities for running AI applications in production.

---

## 2. Objectives

1. Extend cost calculator with audio pricing for voice sessions (gemini-2.0-flash-live)
2. Implement graceful degradation wrappers for Langfuse operations
3. Create observability API endpoints for health checks and cost aggregation
4. Integrate cost tracking into WebSocket voice session traces
5. Add comprehensive unit tests for all new functionality
6. Document Langfuse dashboard usage for the team

---

## 3. Prerequisites

### Required Sessions
- [x] `phase05-session01-langfuse-setup` - Langfuse Docker deployment and client wrapper
- [x] `phase05-session02-rest-api-tracing` - REST API tracing with cost calculation
- [x] `phase05-session03-websocket-tracing` - WebSocket voice session tracing

### Required Tools/Knowledge
- Langfuse SDK v3.x API understanding
- Gemini pricing model (text tokens + audio minutes)
- Hono routing patterns

### Environment Requirements
- Langfuse running via Docker Compose (localhost:3016)
- PostgreSQL database operational
- LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY configured

---

## 4. Scope

### In Scope (MVP)
- Audio cost calculation for gemini-2.0-flash-live (audio minutes)
- Safe wrapper functions for Langfuse operations (graceful degradation)
- Health check endpoint (`GET /api/observability/health`)
- Cost aggregation endpoint (`GET /api/observability/costs`)
- Cost tracking in WebSocket session traces
- Unit tests for cost calculator, safe wrappers, and routes
- Langfuse dashboard documentation

### Out of Scope (Deferred)
- Custom dashboard UI - *Reason: Use Langfuse built-in dashboard*
- Real-time cost alerting - *Reason: Future enhancement when thresholds needed*
- Per-user billing integration - *Reason: No payment system yet*
- Cost export to CSV/JSON - *Reason: Langfuse dashboard provides this*

---

## 5. Technical Approach

### Architecture

```
+-------------------+     +--------------------+     +------------------+
|   API Routes      |     |   Cost Calculator  |     |    Langfuse      |
|                   |     |                    |     |                  |
| /observability/*  +---->|  calculateCost()   +---->|  generation.end  |
| - /health         |     |  calculateAudioCost|     |  { totalCost }   |
| - /costs          |     |                    |     |                  |
+-------------------+     +--------------------+     +------------------+
         |                         ^
         v                         |
+-------------------+     +--------------------+
|   Safe Wrappers   |     | Session Trace Mgr  |
|                   |     |                    |
|  safeTrace()      |     |  Adds cost to      |
|  safeLangfuse()   |     |  session summaries |
+-------------------+     +--------------------+
```

### Design Patterns
- **Safe Wrapper Pattern**: Wrap Langfuse operations to catch errors and continue gracefully
- **Strategy Pattern**: Cost calculation strategies per model type (text vs audio)
- **Singleton Pattern**: Already used for Langfuse client, extend for observability state

### Technology Stack
- Hono v4.x (API routes)
- Langfuse SDK v3.x (tracing)
- Vitest (unit testing)
- Pino (structured logging)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_routes/observability.ts` | Health check and cost aggregation endpoints | ~120 |
| `api/_lib/safe-langfuse.ts` | Graceful degradation wrappers | ~80 |
| `api/_routes/__tests__/observability.test.ts` | Unit tests for observability routes | ~150 |
| `api/_lib/__tests__/safe-langfuse.test.ts` | Unit tests for safe wrappers | ~100 |
| `docs/langfuse-dashboard.md` | Dashboard usage documentation | ~150 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `api/_lib/cost-calculator.ts` | Add audio pricing, calculateAudioCost() | ~40 |
| `api/_lib/__tests__/cost-calculator.test.ts` | Add tests for audio pricing | ~30 |
| `api/_lib/session-trace-manager.ts` | Add cost tracking to session summaries | ~25 |
| `api/index.ts` | Mount observability routes | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Audio cost calculation returns correct values for gemini-2.0-flash-live
- [ ] Health check endpoint returns 200 when Langfuse connected
- [ ] Health check endpoint returns 503 with degraded status when Langfuse down
- [ ] Cost aggregation endpoint returns period, totalCost, byModel breakdown
- [ ] Session traces include cost summary in output metadata
- [ ] App continues functioning when Langfuse unavailable

### Testing Requirements
- [ ] Unit tests for calculateAudioCost() with various inputs
- [ ] Unit tests for safeTrace wrapper error handling
- [ ] Unit tests for health check endpoint (both healthy and degraded states)
- [ ] Unit tests for cost aggregation endpoint
- [ ] Manual testing: disconnect Langfuse, verify graceful degradation

### Quality Gates
- [ ] TypeScript strict mode passing (tsc --noEmit)
- [ ] ESLint passing with no warnings
- [ ] All existing tests pass (npm test)
- [ ] New tests achieve >90% coverage for new code

---

## 8. Implementation Notes

### Key Considerations
- **Cost Precision**: Use 8 decimal places for micro-costs (e.g., $0.00004532)
- **Audio Duration Tracking**: Must track audio minutes in WebSocket sessions
- **Langfuse API Limits**: Be mindful of flush frequency to avoid rate limiting
- **Test Isolation**: Mock Langfuse client in unit tests to avoid external dependencies

### Potential Challenges
- **Audio Duration Measurement**: WebSocket audio chunks don't have explicit duration; may need to calculate from audio sample rate and buffer size
  - *Mitigation*: Start with duration from client-reported metadata, refine later if needed
- **Cost Aggregation Query**: Langfuse SDK may not provide direct aggregation API
  - *Mitigation*: Use trace.update() with cost in metadata, query via Langfuse API or dashboard
- **Graceful Degradation Testing**: Hard to test Langfuse failure in unit tests
  - *Mitigation*: Mock getLangfuse() to return null, verify app behavior

### Gemini Pricing Reference
```
gemini-2.0-flash-live:
  - Input tokens: $0.075 per 1M tokens
  - Output tokens: $0.30 per 1M tokens
  - Audio: $0.40 per minute (bidirectional)
```

---

## 9. Testing Strategy

### Unit Tests
- `cost-calculator.test.ts`: Audio cost calculation edge cases (0 minutes, fractional minutes, combined text+audio)
- `safe-langfuse.test.ts`: Wrapper behavior when Langfuse available vs unavailable
- `observability.test.ts`: Health check responses, cost endpoint responses

### Integration Tests
- Health check endpoint with real Langfuse connection (local Docker)
- Cost aggregation with sample trace data

### Manual Testing
1. Start app with Langfuse running - verify health endpoint returns "healthy"
2. Stop Langfuse container - verify health endpoint returns "degraded"
3. Verify app continues processing requests when Langfuse down
4. Run voice session - verify cost appears in Langfuse dashboard
5. Check cost aggregation endpoint returns expected structure

### Edge Cases
- Zero token/audio usage (should return $0.00)
- Unknown model name (should use default pricing)
- Very large token counts (verify no overflow)
- Langfuse connection timeout (should not block request)
- Concurrent session cost tracking (thread safety)

---

## 10. Dependencies

### External Libraries
- `langfuse`: ^3.x (already installed)
- No new dependencies required

### Other Sessions
- **Depends on**:
  - `phase05-session03-websocket-tracing` (trace infrastructure)
  - `phase05-session02-rest-api-tracing` (cost calculation pattern)
- **Depended by**:
  - None (final session of phase)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
