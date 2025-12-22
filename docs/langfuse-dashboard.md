# Langfuse Dashboard Guide

This guide covers how to use the Langfuse dashboard for AI observability in the Chat with Google Maps application.

## Quick Start

1. **Access the Dashboard**: Open http://localhost:3016 in your browser
2. **Login**: Use the credentials you created during Langfuse setup
3. **Select Project**: Choose your project from the dropdown

## Dashboard Overview

### Traces View

The Traces view shows all AI interactions:

- **Voice Sessions**: Filter by tag `voice` to see WebSocket sessions
- **REST API Calls**: Filter by tag `rest` to see text-based API calls
- **Cost Column**: Shows calculated cost per trace

#### Filtering Traces

- **By Date**: Use the date picker to narrow down timeframes
- **By Tags**: Filter using `voice`, `live-api`, `websocket` for voice sessions
- **By User**: Filter by `userId` for user-specific analysis
- **By Cost**: Sort by cost to find expensive operations

### Generations View

Generations show individual AI model calls with:

- **Input/Output**: The actual request and response content
- **Token Usage**: Input and output token counts
- **Cost**: Calculated cost based on model pricing
- **Latency**: Response time in milliseconds

### Sessions View

Sessions group related traces:

- Voice sessions appear as a single session with multiple turns
- Each turn shows user input and AI response
- Tool calls are tracked within the session

## Cost Analysis

### Viewing Costs

1. Navigate to **Traces** or **Generations**
2. Look at the **Cost** column
3. Click on a trace/generation for detailed breakdown

### Cost Breakdown

For voice sessions (`gemini-2.0-flash-live`):

- Audio: $0.40 per minute (bidirectional)
- Text tokens (if any): $0.075/1M input, $0.30/1M output

For REST API calls (`gemini-2.5-flash`):

- Input tokens: $0.075 per 1M tokens
- Output tokens: $0.30 per 1M tokens

### Cost Aggregation

Use the dashboard's built-in analytics:

1. Go to **Analytics** tab
2. Select date range
3. View cost breakdown by:
   - Day/Week/Month
   - Model
   - User (if tracked)

## API Endpoints

The application provides observability endpoints:

### Health Check

```bash
GET /api/observability/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "components": {
    "langfuse": {
      "status": "healthy",
      "version": "2.95.11"
    }
  }
}
```

Status codes:

- `200`: All components healthy
- `503`: Degraded or unavailable

### Cost Aggregation

```bash
GET /api/observability/costs?start=2025-01-01&end=2025-01-15
```

Response:

```json
{
  "period": {
    "start": "2025-01-01T00:00:00.000Z",
    "end": "2025-01-15T00:00:00.000Z"
  },
  "totalCost": 0,
  "byModel": {},
  "note": "Cost aggregation is tracked in Langfuse..."
}
```

### Quick Status

```bash
GET /api/observability/status
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "langfuseConfigured": true
}
```

## Troubleshooting

### Langfuse Not Showing Traces

1. **Check Configuration**:

   ```bash
   curl http://localhost:3016/api/public/health
   ```

   Should return `{"status":"OK"}`

2. **Verify Environment Variables**:
   - `LANGFUSE_SECRET_KEY` - Must be set
   - `LANGFUSE_PUBLIC_KEY` - Must be set
   - `LANGFUSE_BASE_URL` - Default: http://localhost:3016

3. **Check API Keys**:
   - Login to Langfuse dashboard
   - Go to Settings > API Keys
   - Create or copy keys to your `.env`

### Health Check Returns Degraded

This means Langfuse is unreachable but the app continues working:

1. **Check Langfuse Container**:

   ```bash
   docker ps | grep langfuse
   ```

2. **Check Container Logs**:

   ```bash
   npm run langfuse:logs
   ```

3. **Restart Langfuse**:
   ```bash
   npm run langfuse:stop && npm run langfuse:start
   ```

### Missing Cost Data

Costs are calculated when:

- Session ends (for voice sessions)
- Request completes (for REST API calls)

If costs show $0:

1. Ensure the session/request completed
2. Check that model name matches pricing table
3. Verify token counts are being captured

## Best Practices

### For Development

1. **Filter by Environment**: Use `NODE_ENV` tag to separate dev/prod traces
2. **Use User IDs**: Track costs per user by including `userId` in traces
3. **Tag Sessions**: Add descriptive tags for easier filtering

### For Production

1. **Monitor Health Endpoint**: Set up alerts for `503` responses
2. **Review Costs Weekly**: Use Analytics to track spending trends
3. **Set Up Retention**: Configure data retention in Langfuse settings

## Docker Commands

```bash
# Start Langfuse
npm run langfuse:start

# Stop Langfuse
npm run langfuse:stop

# View logs
npm run langfuse:logs

# Reset (removes all data)
npm run langfuse:reset
```

## Related Documentation

- [Langfuse Official Docs](https://langfuse.com/docs)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Local Deployment Guide](./LOCAL_DEPLOYMENT.md)
