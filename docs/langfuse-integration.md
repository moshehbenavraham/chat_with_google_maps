# Langfuse Integration Guide

Developer guide for adding observability to new code.

## Architecture

```
Request → Middleware (auto-trace) → Route Handler → Langfuse
                                         ↓
                                   c.get('trace')  ← use this
```

**Key files:**

- `api/_lib/langfuse.ts` — Client singleton
- `api/_lib/safe-langfuse.ts` — Error-safe wrappers
- `api/_middleware/langfuse-trace.ts` — Auto-traces all requests
- `api/_lib/session-trace-manager.ts` — Voice session lifecycle
- `api/_lib/cost-calculator.ts` — Token/audio pricing

## REST API Tracing

### Every request is auto-traced

The middleware creates a trace for every request. Access it in any route:

```typescript
app.get('/api/example', c => {
  const trace = c.get('trace'); // LangfuseTraceClient | null
  const traceId = c.get('traceId'); // string | null

  // Your code here
});
```

### Add spans for operations

```typescript
app.post('/api/my-route', async (c) => {
  const trace = c.get('trace');

  // Span for any expensive operation
  const span = trace?.span({ name: 'database-query' });
  const result = await db.query(...);
  span?.end({ output: { rowCount: result.length } });

  return c.json(result);
});
```

### Track LLM generations with cost

```typescript
import { calculateCost } from '../_lib/cost-calculator.js';

app.post('/api/ai-endpoint', async c => {
  const trace = c.get('trace');

  const generation = trace?.generation({
    name: 'gemini-call',
    model: 'gemini-2.5-flash',
    input: { prompt },
  });

  const result = await callGemini(prompt);

  // Extract token usage from response
  const inputTokens = result.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = result.usageMetadata?.candidatesTokenCount ?? 0;

  generation?.end({
    output: result.text,
    usage: { input: inputTokens, output: outputTokens },
    metadata: {
      cost: calculateCost('gemini-2.5-flash', inputTokens, outputTokens),
    },
  });

  return c.json({ text: result.text });
});
```

## Voice Session Tracing

Voice sessions use a different pattern — events sent from frontend.

### Backend: Create session when token requested

```typescript
import { createSession } from '../_lib/session-trace-manager.js';

app.post('/api/live/token', async c => {
  const sessionId = crypto.randomUUID();

  // Creates Langfuse trace for this session
  createSession(sessionId, userId, 'gemini-2.0-flash-live');

  return c.json({ token, sessionId });
});
```

### Frontend: Record events during session

```typescript
import { useVoiceTracing } from '@/hooks/use-voice-tracing';

function VoiceChat() {
  const { startSession, recordTurnStart, recordTurnComplete, endSession } = useVoiceTracing();

  // When session starts
  startSession(sessionId);

  // When user speaks
  recordTurnStart(turnNumber, transcript);

  // When AI responds
  recordTurnComplete(turnNumber, response, durationMs);

  // When session ends
  const summary = await endSession('user_disconnect');
}
```

## Cost Calculation

```typescript
import { calculateCost, calculateAudioCost } from '../_lib/cost-calculator.js';

// REST API (text tokens)
const cost = calculateCost('gemini-2.5-flash', inputTokens, outputTokens);

// Voice (audio + optional tokens)
const cost = calculateAudioCost('gemini-2.0-flash-live', audioMinutes, inputTokens, outputTokens);
```

**Supported models:** See `api/_lib/cost-calculator.ts` for pricing tables.

## Safe Operations

Use safe wrappers when Langfuse failures shouldn't break your code:

```typescript
import { safeExecute, isLangfuseAvailable } from '../_lib/safe-langfuse.js';

// Check availability
if (await isLangfuseAvailable()) {
  // Langfuse is up
}

// Fire-and-forget with error handling
await safeExecute(async langfuse => {
  langfuse.trace({ name: 'background-job' });
});
```

## Quick Reference

| Task               | Code                                        |
| ------------------ | ------------------------------------------- |
| Get trace in route | `c.get('trace')`                            |
| Create span        | `trace?.span({ name: 'op' })`               |
| End span           | `span?.end({ output: data })`               |
| Track LLM call     | `trace?.generation({ name, model, input })` |
| Record cost        | `metadata: { cost: calculateCost(...) }`    |
| Add tags           | `trace?.update({ tags: ['tag1', 'tag2'] })` |
| Set user           | `trace?.update({ userId: 'user-123' })`     |

## Scoring

Scores evaluate trace quality. See `api/_lib/langfuse-scores.ts`.

### Automatic Scores

These are recorded automatically:

| Score               | Type    | When               | Description                     |
| ------------------- | ------- | ------------------ | ------------------------------- |
| `has_results`       | Boolean | Grounding response | Did the search return places?   |
| `result_count`      | Numeric | Grounding response | Normalized result count (0-1)   |
| `latency_rating`    | Numeric | Grounding response | Response speed (1=fast, 0=slow) |
| `session_completed` | Boolean | Voice session end  | Normal completion vs error      |
| `engagement`        | Numeric | Voice session end  | Turn count normalized (0-1)     |
| `tool_usage`        | Boolean | Voice session end  | Were tools used?                |
| `session_duration`  | Numeric | Voice session end  | Duration normalized (0-1)       |

### Manual Scores

Record these via API or code:

```typescript
import { scoreQuality, scoreRelevance, scoreUserFeedback } from '../_lib/langfuse-scores.js';

// Quality assessment (0-1)
scoreQuality(traceId, 0.9, { comment: 'Accurate response' });

// Relevance assessment (0-1)
scoreRelevance(traceId, 0.85);

// User feedback
scoreUserFeedback(traceId, 'positive', 'Found exactly what I needed');
```

### Feedback API

```bash
POST /api/feedback
{
  "traceId": "trace-123",
  "feedback": "positive",  // or "negative"
  "comment": "Great results!",
  "quality": 0.9,         // optional (0-1)
  "relevance": 0.85       // optional (0-1)
}
```

## See Also

- [Dashboard Guide](./langfuse-dashboard.md) — Using the Langfuse UI
- [Langfuse Docs](https://langfuse.com/docs) — Official documentation
