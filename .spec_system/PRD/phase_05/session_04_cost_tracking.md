# Session 04: Cost Tracking & Observability Dashboard

**Session ID**: `phase05-session04-cost-tracking`
**Status**: Not Started
**Estimated Tasks**: ~20-25
**Estimated Duration**: 2-4 hours

---

## Objective

Implement comprehensive cost tracking with aggregation and integrate with the Langfuse observability dashboard for metrics visibility.

---

## Scope

### In Scope (MVP)
- Create cost calculation utility with Gemini pricing
- Store costs in Langfuse generations
- Create daily/weekly cost aggregation endpoint
- Add user-level cost tracking
- Document Langfuse dashboard usage
- Add health check for Langfuse connectivity
- Implement graceful degradation when Langfuse unavailable

### Out of Scope
- Custom dashboard UI (use Langfuse's built-in dashboard)
- Real-time alerting (future enhancement)

---

## Prerequisites

- [ ] Session 03 completed (WebSocket tracing working)
- [ ] All AI interactions traced (REST + WebSocket)
- [ ] Langfuse dashboard accessible with traces

---

## Deliverables

1. Cost calculation utility with full Gemini pricing
2. Costs stored in all Langfuse generations
3. Cost aggregation API endpoint (`/api/observability/costs`)
4. User-level cost tracking
5. Langfuse health check endpoint
6. Graceful degradation implementation
7. Dashboard usage documentation

---

## Implementation Details

### Cost Calculation Utility

```typescript
// api/_lib/cost-calculator.ts
const GEMINI_PRICING = {
  'gemini-2.0-flash': {
    input: 0.075 / 1_000_000,  // $0.075 per 1M input tokens
    output: 0.30 / 1_000_000,  // $0.30 per 1M output tokens
  },
  'gemini-2.0-flash-live': {
    input: 0.075 / 1_000_000,
    output: 0.30 / 1_000_000,
    audio: 0.40 / 60,  // $0.40 per minute of audio
  },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  audioMinutes?: number
): number {
  const pricing = GEMINI_PRICING[model];
  if (!pricing) return 0;

  let cost = (inputTokens * pricing.input) + (outputTokens * pricing.output);
  if (audioMinutes && pricing.audio) {
    cost += audioMinutes * pricing.audio;
  }
  return cost;
}
```

### Store Costs in Generations

```typescript
generation.end({
  output: result,
  usage: {
    input: inputTokens,
    output: outputTokens,
    totalCost: calculateCost(model, inputTokens, outputTokens),
  },
});
```

### Cost Aggregation Endpoint

```typescript
// GET /api/observability/costs
app.get('/observability/costs', authGuard, async (c) => {
  const { period = '7d' } = c.req.query();

  // Query Langfuse for aggregated costs
  // This may use Langfuse API or direct DB queries

  return c.json({
    period,
    totalCost: totalCost,
    byModel: costByModel,
    byUser: costByUser,
    byDay: costByDay,
  });
});
```

### Health Check

```typescript
// GET /api/observability/health
app.get('/observability/health', async (c) => {
  try {
    // Attempt a lightweight Langfuse operation
    await langfuse.flush();
    return c.json({ status: 'healthy', langfuse: 'connected' });
  } catch (error) {
    return c.json({ status: 'degraded', langfuse: 'unavailable' }, 503);
  }
});
```

### Graceful Degradation

```typescript
// Wrapper that handles Langfuse unavailability
export async function safeTrace<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    log.warn({ error }, 'Langfuse tracing failed, continuing without trace');
    return fallback;
  }
}
```

### Dashboard Documentation

Document key Langfuse dashboard features:
- **Trace explorer**: For debugging individual conversations
- **Latency percentiles**: p50, p95, p99 response times
- **Cost breakdown**: By model, user, and time period
- **Error rate monitoring**: Track failed AI calls
- **Session correlation**: Group related traces

---

## Success Criteria

- [ ] Accurate cost tracking per request
- [ ] Cost aggregation by user/day/model
- [ ] Cost aggregation endpoint working
- [ ] Dashboard shows latency metrics (p50, p95, p99)
- [ ] Error tracking integrated
- [ ] Health check endpoint operational
- [ ] Graceful degradation tested
- [ ] Dashboard usage documented
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
- [ ] All existing tests pass
