# Session 03: WebSocket Voice Session Tracing

**Session ID**: `phase05-session03-websocket-tracing`
**Status**: Not Started
**Estimated Tasks**: ~25-30
**Estimated Duration**: 3-4 hours

---

## Objective

Instrument real-time voice sessions via WebSocket with turn-by-turn tracing, including tool call tracking and session-level aggregation.

---

## Scope

### In Scope (MVP)
- Create session-level trace on WebSocket connection
- Create span for each conversation turn
- Track tool calls within turns
- Record AI response generation with token usage
- Handle session end and calculate totals
- Flush traces on WebSocket disconnect

### Out of Scope
- REST API tracing (Session 02 - already done)
- Cost aggregation dashboard (Session 04)

---

## Prerequisites

- [ ] Session 02 completed (REST API tracing working)
- [ ] WebSocket voice endpoint operational
- [ ] Langfuse tracing middleware available

---

## Deliverables

1. Session-level trace on WebSocket connection
2. Turn-by-turn span creation
3. Tool call tracking within turns
4. Generation spans for AI responses
5. Session-end summary with totals
6. Proper trace flushing on disconnect

---

## Implementation Details

### Session-Level Trace

```typescript
// api/_routes/live.ts
const sessionTrace = langfuse.trace({
  name: 'voice-session',
  userId: userId,
  sessionId: sessionId, // correlate all turns
  metadata: {
    audioConfig: config,
    startTime: new Date().toISOString(),
  },
});
```

### Turn-by-Turn Spans

```typescript
const turnSpan = sessionTrace.span({
  name: `turn-${turnNumber}`,
  input: {
    userTranscript: transcribedText,
    audioLengthMs: audioLength,
  },
});
```

### Tool Call Tracking

```typescript
const toolSpan = turnSpan.span({
  name: `tool-${toolName}`,
  input: toolArgs,
});
// Execute tool
toolSpan.end({ output: toolResult });
```

### AI Response Generation

```typescript
const generation = turnSpan.generation({
  name: 'gemini-live-response',
  model: 'gemini-2.0-flash-live',
  input: { context, userMessage },
});
// Stream response
generation.end({
  output: fullResponse,
  usage: { input: inputTokens, output: outputTokens },
});
```

### Session End Handling

```typescript
sessionTrace.update({
  output: {
    totalTurns: turnCount,
    totalToolCalls: toolCallCount,
    sessionDurationMs: Date.now() - startTime,
  },
});
await langfuse.flushAsync();
```

### Voice Turn Tracing Helper

```typescript
async function traceVoiceTurn(
  sessionTrace: LangfuseTraceClient,
  turnNumber: number,
  userInput: string,
  aiResponse: string,
  toolCalls: ToolCall[],
  tokenUsage: TokenUsage
) {
  const turnSpan = sessionTrace.span({
    name: `voice-turn-${turnNumber}`,
    input: { userTranscript: userInput },
  });

  // Track each tool call
  for (const tool of toolCalls) {
    const toolSpan = turnSpan.span({
      name: `tool-${tool.name}`,
      input: tool.args,
    });
    toolSpan.end({ output: tool.result });
  }

  // Track the generation
  turnSpan.generation({
    name: 'gemini-response',
    model: 'gemini-2.0-flash-live',
    input: userInput,
    output: aiResponse,
    usage: {
      input: tokenUsage.input,
      output: tokenUsage.output,
      totalCost: calculateCost('gemini-2.0-flash-live', tokenUsage.input, tokenUsage.output),
    },
  });

  turnSpan.end({ output: { responseLength: aiResponse.length } });
}
```

---

## Success Criteria

- [ ] Voice sessions grouped as single trace
- [ ] Individual turns visible as spans
- [ ] Tool calls tracked within turns
- [ ] AI responses traced with token usage
- [ ] Session-level metrics aggregated (total turns, duration)
- [ ] Traces flushed properly on disconnect
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
- [ ] All existing tests pass
