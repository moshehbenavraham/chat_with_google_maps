# Session Specification

**Session ID**: `phase05-session03-websocket-tracing`
**Phase**: 05 - AI Observability (Langfuse)
**Status**: Not Started
**Created**: 2025-12-22

---

## 1. Session Overview

This session implements comprehensive tracing for real-time voice sessions that use the Gemini Live API via WebSocket. Since the application uses a **client-side WebSocket architecture** (the browser connects directly to Gemini using ephemeral tokens from `/api/live/token`), we need a **frontend-assisted tracing** approach where the client reports session events to backend endpoints that record them in Langfuse.

The implementation creates a complete observability pipeline: session traces are initiated when tokens are requested, the frontend POSTs turn events (user transcripts, AI responses, tool calls) to dedicated backend endpoints, and traces are finalized when sessions end. This enables full visibility into voice conversations including turn-by-turn latency, tool execution timing, and session-level aggregates.

This session is critical for AI observability because voice conversations are the primary user interaction in this voice-first application. Without WebSocket tracing, the majority of AI operations would remain unobservable, limiting our ability to debug issues, optimize performance, and track costs.

---

## 2. Objectives

1. **Session-level tracing**: Create Langfuse traces when voice sessions start (token request) and finalize them on session end
2. **Turn-by-turn spans**: Record each conversation turn as a span with user input, AI response, and timing
3. **Tool call tracking**: Capture tool executions within turns as nested spans with inputs/outputs
4. **Frontend integration**: Build a lightweight tracing client that reports events to the backend without impacting voice latency

---

## 3. Prerequisites

### Required Sessions
- [x] `phase05-session01-langfuse-setup` - Langfuse Docker deployment and client wrapper
- [x] `phase05-session02-rest-api-tracing` - REST API tracing middleware and patterns

### Required Tools/Knowledge
- Langfuse SDK (trace, span, generation APIs)
- Hono middleware patterns
- React hooks and event handling
- WebSocket lifecycle events

### Environment Requirements
- Langfuse running via Docker Compose (port 3016)
- LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY configured
- PostgreSQL running for app database

---

## 4. Scope

### In Scope (MVP)
- Create session trace on token request with unique session ID
- Backend endpoints for receiving turn events from frontend
- Frontend tracing client that posts events without blocking
- Turn spans with user transcript, AI response, duration
- Tool call spans nested within turns
- Session end handling with totals (turns, duration, tool calls)
- Graceful degradation when Langfuse unavailable

### Out of Scope (Deferred)
- Token usage tracking for Gemini Live - *Reason: Gemini Live API does not expose token counts in responses*
- Audio duration/cost tracking - *Reason: Deferred to Session 04 cost tracking*
- Real-time streaming span updates - *Reason: Complexity vs value; batch on turn complete*
- Server-side WebSocket proxy - *Reason: Would require major architecture change*

---

## 5. Technical Approach

### Architecture

```
Browser (Frontend)                          Backend (Hono)                    Langfuse
+------------------+                       +------------------+              +----------+
|                  |  POST /live/token     |                  |   trace()    |          |
| GenAILiveClient  | --------------------> | Create session   | -----------> | Session  |
|                  |  { sessionId }        | trace            |              | Trace    |
|                  |                       |                  |              |          |
| (voice session)  |  POST /live/event     |                  |   span()     |          |
|  turn events     | --------------------> | Record turn      | -----------> | Turn     |
|  tool calls      |  { type, data }       | span             |              | Spans    |
|  transcripts     |                       |                  |              |          |
|                  |  POST /live/end       |                  |   update()   |          |
| Session end      | --------------------> | Finalize trace   | -----------> | Summary  |
+------------------+                       +------------------+              +----------+
```

### Design Patterns
- **Event sourcing**: Frontend emits discrete events; backend records them
- **Fire-and-forget**: Frontend POSTs events without waiting for response (non-blocking)
- **Graceful degradation**: Tracing failures don't break the voice session
- **Session correlation**: All events linked via sessionId

### Technology Stack
- `langfuse` ^3.x (SDK)
- Hono routes for event ingestion
- React custom hook for tracing client
- UUID v4 for session IDs

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_routes/live-trace.ts` | Trace event endpoints | ~150 |
| `api/_lib/session-trace-manager.ts` | Manages active session traces | ~120 |
| `api/_lib/types/live-trace.ts` | TypeScript types for trace events | ~60 |
| `src/lib/tracing/voice-trace-client.ts` | Frontend tracing client | ~100 |
| `src/hooks/use-voice-tracing.ts` | React hook for voice tracing | ~80 |
| `api/_routes/__tests__/live-trace.test.ts` | Unit tests for trace routes | ~150 |
| `api/_lib/__tests__/session-trace-manager.test.ts` | Unit tests for trace manager | ~100 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `api/_routes/live.ts` | Add sessionId to token response, create trace | ~30 |
| `api/_app.ts` | Mount live-trace routes | ~5 |
| `src/hooks/use-live-api.ts` | Integrate voice tracing hook | ~40 |
| `src/lib/api/genai-live-client.ts` | Emit tracing-friendly events | ~20 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Token endpoint returns sessionId for trace correlation
- [ ] Session trace created in Langfuse on token request
- [ ] Turn events (start, complete) recorded as spans
- [ ] Tool calls recorded as nested spans within turns
- [ ] User/AI transcripts captured in span metadata
- [ ] Session end finalizes trace with summary metrics
- [ ] Multiple concurrent sessions traced independently

### Testing Requirements
- [ ] Unit tests for all backend endpoints (>80% coverage)
- [ ] Unit tests for session trace manager
- [ ] Integration test: complete session lifecycle
- [ ] Manual test: verify traces appear in Langfuse dashboard

### Quality Gates
- [ ] TypeScript strict mode passing (zero errors)
- [ ] ESLint passing (zero warnings)
- [ ] All existing tests still pass
- [ ] No impact on voice latency (fire-and-forget)

---

## 8. Implementation Notes

### Key Considerations

1. **Non-blocking tracing**: Frontend must not await POST responses to avoid latency
2. **Session cleanup**: Orphaned traces (no end event) should timeout gracefully
3. **Event ordering**: Events may arrive out of order; use timestamps for ordering
4. **Memory management**: Don't accumulate unbounded event data on backend

### Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| Events arriving after session end | Queue events briefly; process on end |
| Browser tab closed without end event | Backend timeout + periodic cleanup |
| High event volume under load | Batch events in frontend; debounce |
| Langfuse unavailable | Log locally; don't fail the session |

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- Token endpoint creates trace with correct metadata
- Event endpoint validates payload and records spans
- End endpoint finalizes trace with summary
- Session manager handles concurrent sessions
- Frontend client batches and posts events

### Integration Tests
- Complete session: token -> turns -> tool calls -> end
- Verify traces appear in Langfuse with correct hierarchy
- Test graceful degradation when Langfuse down

### Manual Testing
1. Start voice session, have conversation, end session
2. Open Langfuse dashboard at localhost:3016
3. Find session trace, expand to see turn spans
4. Verify tool call spans nested under turns
5. Check session summary (duration, turn count)

### Edge Cases
- Session ends before any turns (immediate disconnect)
- Tool call times out or errors
- Multiple rapid turns (user interrupts AI)
- Browser refresh mid-session
- Network error posting events

---

## 10. Dependencies

### External Libraries
- `langfuse`: ^3.x (already installed)
- `uuid`: ^9.x (for session IDs, may need to install)

### Other Sessions
- **Depends on**: `phase05-session01-langfuse-setup`, `phase05-session02-rest-api-tracing`
- **Depended by**: `phase05-session04-cost-tracking` (adds cost metrics to traces)

---

## 11. API Design

### POST /api/live/token (Modified)
Existing endpoint, modified to create trace and return sessionId.

**Response**:
```json
{
  "token": "ephemeral-token-string",
  "expiresAt": "2025-01-01T00:30:00.000Z",
  "sessionId": "uuid-v4-session-id"
}
```

### POST /api/live/trace/event
Record a session event (turn start, turn complete, tool call).

**Request**:
```json
{
  "sessionId": "uuid-v4-session-id",
  "type": "turn_start" | "turn_complete" | "tool_call" | "tool_result",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "data": {
    // type-specific payload
  }
}
```

**Turn Start Data**:
```json
{
  "turnNumber": 1,
  "userTranscript": "Take me to the Eiffel Tower"
}
```

**Turn Complete Data**:
```json
{
  "turnNumber": 1,
  "aiTranscript": "Sure, navigating to the Eiffel Tower in Paris...",
  "durationMs": 1847
}
```

**Tool Call Data**:
```json
{
  "turnNumber": 1,
  "toolName": "navigate_to_location",
  "toolArgs": { "lat": 48.8584, "lng": 2.2945 }
}
```

**Tool Result Data**:
```json
{
  "turnNumber": 1,
  "toolName": "navigate_to_location",
  "result": { "success": true },
  "durationMs": 234
}
```

**Response**: `204 No Content` (fire-and-forget)

### POST /api/live/trace/end
Finalize a session trace.

**Request**:
```json
{
  "sessionId": "uuid-v4-session-id",
  "reason": "user_disconnect" | "error" | "timeout"
}
```

**Response**:
```json
{
  "traceId": "langfuse-trace-id",
  "summary": {
    "totalTurns": 5,
    "totalToolCalls": 3,
    "durationMs": 45000
  }
}
```

---

## 12. Data Flow

```
1. User clicks "Play" to start voice session
   |
   v
2. Frontend: fetchLiveToken() -> POST /api/live/token
   |
   v
3. Backend: Create Langfuse trace, return { token, sessionId }
   |
   v
4. Frontend: Store sessionId, connect to Gemini via WebSocket
   |
   v
5. User speaks -> inputTranscription event
   |
   v
6. Frontend: POST /api/live/trace/event { type: "turn_start", userTranscript }
   |
   v
7. AI responds -> toolcall event (if any)
   |
   v
8. Frontend: POST /api/live/trace/event { type: "tool_call", toolName, args }
   |
   v
9. Tool executes -> result
   |
   v
10. Frontend: POST /api/live/trace/event { type: "tool_result", result, duration }
    |
    v
11. AI finishes speaking -> turncomplete event
    |
    v
12. Frontend: POST /api/live/trace/event { type: "turn_complete", aiTranscript, duration }
    |
    v
13. Repeat 5-12 for each turn...
    |
    v
14. User clicks "Stop" or connection closes
    |
    v
15. Frontend: POST /api/live/trace/end { sessionId, reason }
    |
    v
16. Backend: Finalize trace with summary, flush to Langfuse
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
