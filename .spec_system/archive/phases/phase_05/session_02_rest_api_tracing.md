# Session 02: REST API Tracing (Gemini Grounding)

**Session ID**: `phase05-session02-rest-api-tracing`
**Status**: Not Started
**Estimated Tasks**: ~20-25
**Estimated Duration**: 2-4 hours

---

## Objective

Instrument the `/api/gemini/grounding` endpoint with full tracing including token usage, latency, and cost tracking.

---

## Scope

### In Scope (MVP)
- Create tracing middleware for Hono
- Instrument Gemini grounding calls with generation spans
- Track token usage (input/output tokens)
- Add cost calculation based on Gemini pricing
- Correlate with existing Pino request logger (add trace ID)
- Verify traces appear with correct metadata in dashboard

### Out of Scope
- WebSocket session tracing (Session 03)
- Cost aggregation and dashboard integration (Session 04)

---

## Prerequisites

- [ ] Session 01 completed (Langfuse setup and running)
- [ ] Langfuse UI accessible and receiving test traces
- [ ] Gemini grounding endpoint operational (`/api/gemini/grounding`)

---

## Deliverables

1. Langfuse tracing middleware for Hono
2. Instrumented Gemini grounding endpoint
3. Token usage tracking per request
4. Cost calculation utility
5. Trace ID correlation with Pino logger
6. Verified traces in Langfuse dashboard

---

## Implementation Details

### Tracing Middleware

```typescript
// api/_middleware/langfuse-trace.ts
import type { MiddlewareHandler } from 'hono';
import { langfuse } from '../_lib/langfuse.js';

export const langfuseTrace: MiddlewareHandler = async (c, next) => {
  const trace = langfuse.trace({
    name: `${c.req.method} ${c.req.path}`,
    userId: c.get('session')?.userId,
    sessionId: c.req.header('x-session-id'),
    metadata: {
      ip: c.req.header('x-forwarded-for'),
      userAgent: c.req.header('user-agent'),
    },
  });

  c.set('trace', trace);

  const start = Date.now();
  try {
    await next();
  } finally {
    trace.update({
      output: { status: c.res.status, durationMs: Date.now() - start },
    });
  }
};
```

### Gemini Generation Tracing

```typescript
// In gemini.ts route
const generation = trace.generation({
  name: 'gemini-grounding',
  model: 'gemini-2.0-flash',
  input: { prompt, location: { lat, lng } },
  modelParameters: { temperature: 0.7 },
});

const result = await callGeminiApi(prompt, lat, lng);

generation.end({
  output: result,
  usage: {
    input: result.usageMetadata?.promptTokenCount,
    output: result.usageMetadata?.candidatesTokenCount,
  },
});
```

### Cost Calculation

```typescript
// api/_lib/cost-calculator.ts
const GEMINI_PRICING = {
  'gemini-2.0-flash': {
    input: 0.075 / 1_000_000,  // $0.075 per 1M input tokens
    output: 0.30 / 1_000_000,  // $0.30 per 1M output tokens
  },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = GEMINI_PRICING[model];
  if (!pricing) return 0;
  return (inputTokens * pricing.input) + (outputTokens * pricing.output);
}
```

---

## Success Criteria

- [ ] Tracing middleware created and applied to routes
- [ ] All grounding requests traced in Langfuse
- [ ] Token usage tracked (input + output tokens)
- [ ] Cost calculated per request
- [ ] Latency visible in dashboard
- [ ] Trace ID in Pino logs for correlation
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
- [ ] All existing tests pass
