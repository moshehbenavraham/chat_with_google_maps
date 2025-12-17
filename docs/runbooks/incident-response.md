# Incident Response

## Severity Levels

| Level | Description                     | Response Time     |
| ----- | ------------------------------- | ----------------- |
| P0    | App completely broken           | Immediate         |
| P1    | Core feature broken (voice/map) | < 1 hour          |
| P2    | Minor feature broken            | < 4 hours         |
| P3    | Cosmetic/minor                  | Next business day |

## Common Incidents

### Map Not Loading

**Symptoms**: 3D map shows blank or error

**Resolution**:

1. Check browser console for API errors
2. Verify `GOOGLE_MAPS_API_KEY` in environment
3. Check Google Cloud Console for quota/billing issues
4. Verify required APIs are enabled

### Voice Not Working

**Symptoms**: Microphone icon unresponsive, no AI responses

**Resolution**:

1. Check browser console for WebSocket errors
2. Verify `GEMINI_API_KEY` in environment
3. Check browser microphone permissions
4. Verify HTTPS (required for microphone access in production)

### API Quota Exceeded

**Symptoms**: API calls failing with quota errors

**Resolution**:

1. Check Google Cloud Console for quota usage
2. Wait for quota reset or request increase
3. Consider implementing caching

### Deployment Failure

**Symptoms**: Vercel deployment fails

**Resolution**:

1. Check Vercel build logs
2. Run `npm run build` locally to reproduce
3. Fix build errors
4. Redeploy

## Logs

- Browser Console: Runtime errors
- Vercel Dashboard: Deployment logs
- Google Cloud Console: API usage and errors
