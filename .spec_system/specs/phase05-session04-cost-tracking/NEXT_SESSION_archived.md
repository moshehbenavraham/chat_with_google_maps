# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-22
**Project State**: Phase 05 - AI Observability (Langfuse)
**Completed Sessions**: 25

---

## Recommended Next Session

**Session ID**: `phase05-session04-cost-tracking`
**Session Name**: Cost Tracking & Observability Dashboard
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: ~20-25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 03 completed (WebSocket tracing working)
- [x] All AI interactions traced (REST + WebSocket)
- [x] Langfuse dashboard accessible with traces

### Dependencies
- **Builds on**: `phase05-session03-websocket-tracing` (completed)
- **Enables**: Phase 05 completion, production-ready AI observability

### Project Progression

This is the **final session of Phase 05** and completes the AI Observability stack. With REST API tracing (Session 02) and WebSocket voice session tracing (Session 03) already in place, this session adds the critical cost tracking and operational monitoring capabilities that make the observability system production-ready.

Cost tracking is essential for:
1. Understanding AI usage patterns and expenses
2. Budgeting and cost optimization decisions
3. Per-user cost allocation for future billing features
4. Operational monitoring with graceful degradation

---

## Session Overview

### Objective

Implement comprehensive cost tracking with aggregation and integrate with the Langfuse observability dashboard for metrics visibility.

### Key Deliverables
1. Cost calculation utility with full Gemini pricing (text + audio)
2. Costs stored in all Langfuse generations
3. Cost aggregation API endpoint (`/api/observability/costs`)
4. User-level cost tracking
5. Langfuse health check endpoint (`/api/observability/health`)
6. Graceful degradation when Langfuse unavailable
7. Dashboard usage documentation

### Scope Summary
- **In Scope (MVP)**: Cost calculator, cost storage in traces, aggregation endpoint, health check, graceful degradation, documentation
- **Out of Scope**: Custom dashboard UI (use Langfuse's built-in), real-time alerting (future enhancement)

---

## Technical Considerations

### Technologies/Patterns
- Langfuse SDK cost tracking via `usage.totalCost`
- Gemini pricing model implementation ($0.075/1M input, $0.30/1M output, $0.40/min audio)
- Hono API endpoints for cost aggregation
- Safe wrapper pattern for graceful degradation

### Potential Challenges
- **Accurate token counting**: Ensure input/output tokens from Gemini responses are correctly extracted
- **Audio cost calculation**: Track audio duration for voice sessions accurately
- **Langfuse API availability**: Need robust error handling for metrics queries
- **Cost precision**: Use appropriate decimal precision to avoid rounding errors

### Key Files to Create/Modify
```
api/_lib/cost-calculator.ts      # NEW: Cost calculation utility
api/_routes/observability.ts     # NEW: Health check and cost endpoints
api/_lib/langfuse.ts             # MODIFY: Add safe wrapper functions
docs/langfuse-dashboard.md       # NEW: Dashboard usage documentation
```

---

## Success Criteria

- [ ] Accurate cost tracking per request (text tokens + audio)
- [ ] Cost aggregation by user/day/model working
- [ ] Cost aggregation endpoint operational (`/api/observability/costs`)
- [ ] Dashboard shows latency metrics (p50, p95, p99)
- [ ] Error tracking integrated with Langfuse
- [ ] Health check endpoint operational (`/api/observability/health`)
- [ ] Graceful degradation tested (app works when Langfuse down)
- [ ] Dashboard usage documented
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
- [ ] All existing tests pass

---

## Alternative Sessions

If this session is blocked:
1. **None available in Phase 05** - This is the final session
2. **Consider Phase 06 planning** - Define next phase requirements if observability is blocked

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
