# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-22
**Project State**: Phase 05 - AI Observability (Langfuse)
**Completed Sessions**: 24

---

## Recommended Next Session

**Session ID**: `phase05-session03-websocket-tracing`
**Session Name**: WebSocket Voice Session Tracing
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: 25-30

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 02 completed (REST API tracing working)
- [x] WebSocket voice endpoint operational (core app functionality)
- [x] Langfuse tracing middleware available (from Session 02)
- [x] Langfuse Docker deployment running (from Session 01)

### Dependencies
- **Builds on**: `phase05-session02-rest-api-tracing` - Uses the same Langfuse client wrapper and tracing patterns
- **Enables**: `phase05-session04-cost-tracking` - Cost aggregation requires all AI interactions traced

### Project Progression

This is the natural next step in the AI observability implementation:

1. **Session 01** (Complete): Deployed Langfuse and created client wrapper
2. **Session 02** (Complete): Instrumented REST API endpoints with tracing
3. **Session 03** (Next): Instrument WebSocket voice sessions with turn-by-turn tracing
4. **Session 04** (Pending): Add cost tracking and dashboard integration

WebSocket tracing is critical for this voice-first application since the primary user interaction happens through real-time voice conversations via WebSocket. Without this session, the majority of AI interactions would remain unobservable.

---

## Session Overview

### Objective
Instrument real-time voice sessions via WebSocket with turn-by-turn tracing, including tool call tracking and session-level aggregation.

### Key Deliverables
1. Session-level trace on WebSocket connection
2. Turn-by-turn span creation for conversation flow
3. Tool call tracking within conversation turns
4. Generation spans for AI responses with token usage
5. Session-end summary with aggregated totals
6. Proper trace flushing on WebSocket disconnect

### Scope Summary
- **In Scope (MVP)**: Session traces, turn spans, tool spans, generation tracking, session totals, flush on disconnect
- **Out of Scope**: REST API tracing (Session 02), cost aggregation dashboard (Session 04)

---

## Technical Considerations

### Technologies/Patterns
- Langfuse SDK (`langfuse` npm package)
- Langfuse trace/span/generation hierarchy
- WebSocket lifecycle hooks (connect, message, disconnect)
- Async trace flushing

### Voice Session Tracing Model

```
Trace: Voice Session (session_id)
  └── Span: WebSocket Session
        ├── Generation: Turn 1 (user speech → AI response)
        │     └── Span: tool-navigate_to_location
        ├── Generation: Turn 2 (user speech → AI response)
        │     └── Span: tool-search_nearby
        └── ... more turns
```

### Potential Challenges
1. **Streaming responses**: AI responses stream incrementally; need to aggregate before ending generation span
2. **Tool call timing**: Tool calls occur mid-turn; need to track as nested spans within turn
3. **Disconnect handling**: WebSocket can disconnect unexpectedly; must ensure traces flush properly
4. **Token counting**: Gemini Live API may not provide token counts directly; may need estimation

---

## Alternative Sessions

If this session is blocked:

1. **phase05-session04-cost-tracking** - Could implement cost tracking for REST endpoints only, but loses value without WebSocket data
2. **Return to maintenance** - Address any tech debt or bug fixes before proceeding

Note: Session 03 has no blockers as all prerequisites are met.

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task breakdown.
