# PRD Phase 05: AI Observability (Langfuse)

**Status**: In Progress
**Sessions**: 4
**Estimated Duration**: 2-3 days

**Progress**: 2/4 sessions (50%)

---

## Overview

Implement comprehensive AI observability for the voice agent using Langfuse, an open-source LLM observability platform. This enables tracing of all AI interactions including real-time voice sessions via WebSocket, cost tracking, latency monitoring, and conversation debugging while remaining **fully self-hostable**.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | Langfuse Setup & Docker Deployment | Complete | 22 | 2025-12-22 |
| 02 | REST API Tracing (Gemini Grounding) | Complete | 22 | 2025-12-22 |
| 03 | WebSocket Voice Session Tracing | Not Started | ~25-30 | - |
| 04 | Cost Tracking & Observability Dashboard | Not Started | ~20-25 | - |

---

## Completed Sessions

### Session 01: Langfuse Setup & Docker Deployment (2025-12-22)

Established foundational AI observability infrastructure:
- Deployed Langfuse server and PostgreSQL via Docker Compose (ports 3016, 5440)
- Created singleton Langfuse client wrapper with environment-aware flush settings
- Implemented graceful shutdown handlers for SIGTERM/SIGINT signals
- Added test trace endpoint for verification (/api/trace-test)
- NPM scripts for lifecycle management (langfuse:start, stop, logs, reset)

### Session 02: REST API Tracing (Gemini Grounding) (2025-12-22)

Implemented comprehensive tracing for REST API layer:
- Created Langfuse tracing middleware for automatic trace creation on all API requests
- Instrumented Gemini grounding endpoint with generation spans capturing input/output
- Implemented cost calculator utility with Gemini pricing (2.5-flash, 2.0-flash, 1.5-flash, 1.5-pro)
- Added trace ID correlation with Pino logger for unified debugging
- Token usage extraction from Gemini usageMetadata
- Graceful degradation when Langfuse unavailable

---

## Upcoming Sessions

- Session 03: WebSocket Voice Session Tracing

---

## Objectives

1. Deploy Langfuse locally via Docker Compose (self-hosted)
2. Create Langfuse client wrapper for Hono backend
3. Trace REST API calls (Gemini grounding endpoint)
4. Trace WebSocket voice sessions with turn-by-turn spans
5. Implement cost tracking per conversation (tokens + audio)
6. Add user/session correlation for conversation grouping
7. Create observability dashboard integration

---

## Prerequisites

- Phase 04 completed (Frontend Overhaul with full UI modernization)
- Hono backend operational with API routes
- PostgreSQL database running via Docker
- Docker Compose environment established

---

## Technical Considerations

### Architecture

```
AI Observability Stack
----------------------
React Client                    Hono Backend
+--------------+               +--------------------------------+
| Voice Agent  |<--WebSocket-->| /api/live/*                    |
|              |               |   +-- Langfuse trace (session) |
| Chat UI      |<---REST------>| /api/gemini/grounding          |
|              |               |   +-- Langfuse trace (gen)     |
+--------------+               +--------------------------------+
                                          |
                                          v
                               +----------------------+
                               |     Langfuse         |
                               |  (Self-Hosted)       |
                               +----------------------+
                               | +-- Traces           |
                               | |   +-- Sessions     |
                               | |   +-- Generations  |
                               | |   +-- Spans        |
                               | +-- Costs            |
                               | +-- Latency Metrics  |
                               | +-- User Analytics   |
                               +----------------------+
                                          |
                                          v
                               +----------------------+
                               |    PostgreSQL        |
                               |  (Langfuse Data)     |
                               +----------------------+
```

### Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Langfuse | ^3.x | Open-source LLM observability |
| langfuse (npm) | ^3.x | TypeScript SDK |
| Docker | latest | Self-hosted deployment |

### Voice Session Tracing Model

```
Trace: Voice Conversation (session_id: abc123)
+---------------------------------------------------------------------+
| Span: WebSocket Session                                              |
| metadata: { user_id, session_start, audio_config }                   |
|                                                                      |
|  +--------------------------------------------------------------+   |
|  | Generation: Turn 1 (User Speech -> AI Response)              |   |
|  | input: { audio_transcript, tool_calls }                      |   |
|  | output: { response_text, map_actions }                       |   |
|  | metrics: { latency_ms, input_tokens, output_tokens }         |   |
|  +--------------------------------------------------------------+   |
|                                                                      |
|  +--------------------------------------------------------------+   |
|  | Span: Tool Execution (navigate_to_location)                  |   |
|  | input: { lat, lng, place_name }                              |   |
|  | output: { success, camera_position }                         |   |
|  +--------------------------------------------------------------+   |
|                                                                      |
|  +--------------------------------------------------------------+   |
|  | Generation: Turn 2 (User Speech -> AI Response)              |   |
|  | ...                                                          |   |
|  +--------------------------------------------------------------+   |
|                                                                      |
+---------------------------------------------------------------------+
Summary: 5 turns, 2 tool calls, $0.0034 total cost, 1847ms avg latency
```

### Risks

- **Performance overhead from tracing**: Async flush, batch events, sample high-traffic endpoints
- **WebSocket complexity**: Start with REST tracing, incrementally add WS support
- **Cost tracking accuracy**: Verify against Gemini billing, add margin of error
- **Data volume in Langfuse DB**: Configure retention policies, archive old traces
- **Langfuse service downtime**: Graceful degradation - app works without tracing

---

## Success Criteria

Phase complete when:
- [ ] All 4 sessions completed and validated
- [ ] Langfuse running via Docker Compose (self-hosted)
- [ ] Langfuse SDK integrated with Hono backend
- [ ] REST API endpoints traced (`/api/gemini/grounding`)
- [ ] WebSocket voice sessions traced with turn-by-turn spans
- [ ] Tool calls tracked within conversation turns
- [ ] Cost tracking per request (tokens + audio minutes)
- [ ] User/session correlation for conversation grouping
- [ ] Latency metrics visible in Langfuse dashboard
- [ ] Cost aggregation by user/day/model available
- [ ] Graceful degradation when Langfuse unavailable
- [ ] Documentation for Langfuse dashboard usage

---

## Dependencies

### Depends On
- Phase 04: Frontend Overhaul - Complete

### Enables
- Future phases: Enhanced analytics, A/B testing, model evaluation

---

## Why Langfuse

| Platform | Open Source | Self-Hostable | WebSocket Support | JS SDK | Cost Tracking |
|----------|-------------|---------------|-------------------|--------|---------------|
| **Langfuse** | Yes (MIT) | Yes (Docker) | Yes | Yes | Yes |
| OpenLLMetry | Yes | Partial | Limited | Yes | Limited |
| Helicone | Yes | Yes | No (proxy-based) | Yes | Yes |
| Phoenix (Arize) | Yes | Yes | Limited | Partial | No |
| LangSmith | No | No | Yes | Yes | Yes |

**Langfuse Advantages:**
- **Open Source**: MIT license, full code access, active development
- **Self-Hostable**: Docker Compose deployment, full data sovereignty
- **Voice/Streaming Support**: Async spans work with WebSocket sessions
- **Conversation Tracing**: Group related calls into sessions/traces
- **Cost Tracking**: Automatic token counting and cost calculation
- **Latency Monitoring**: Built-in duration tracking per span
- **Gemini Compatible**: Works with any LLM provider via manual instrumentation
- **Low Overhead**: Async flush, minimal latency impact

---

## Dependencies Summary

**Add**:
```json
{
  "langfuse": "^3.x"
}
```

**Docker Services**:
```yaml
# Added to docker-compose.yml
langfuse-server:
  image: langfuse/langfuse:latest
  ports: ["3001:3000"]
langfuse-db:
  image: postgres:16-alpine
```

**Environment Variables**:
```
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_BASE_URL=http://localhost:3001
```

---

## References

- [Langfuse Documentation](https://langfuse.com/docs)
- [Langfuse Self-Hosting Guide](https://langfuse.com/docs/deployment/self-host)
- [Langfuse JS/TS SDK](https://langfuse.com/docs/sdk/typescript)
- [Langfuse Tracing Concepts](https://langfuse.com/docs/tracing)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [GitHub: langfuse/langfuse](https://github.com/langfuse/langfuse)
