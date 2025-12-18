# Backend API

Hono-based API layer providing server-side credential protection and Google API proxying.

## Overview

The API is **deployment-agnostic** - the same code runs on Vercel, Cloudflare Workers, AWS Lambda, Bun, or self-hosted Node.js.

## Structure

```
api/
├── _app.ts           # Route mounting (platform-agnostic core)
├── _server.ts        # Development server entry
├── [[...route]].ts   # Vercel serverless entry point
├── _adapters/        # Platform-specific adapters
│   ├── node.ts       # @hono/node-server for local dev & Docker
│   └── vercel.ts     # Vercel serverless export
├── _middleware/      # Hono middleware
│   └── error-handler.ts
├── _routes/          # API route handlers
│   ├── health.ts     # Health check endpoint
│   ├── gemini.ts     # Gemini API proxy
│   └── maps.ts       # Google Maps API proxy
├── _lib/             # Shared utilities
└── _tests/           # API tests
```

## Run Commands

| Command                | Purpose                       |
| ---------------------- | ----------------------------- |
| `npm run api:dev`      | Start API dev server on :3011 |
| `npm run dev:all`      | Start both frontend and API   |
| `npm run docker:build` | Build Docker image            |
| `npm run docker:run`   | Run API in Docker             |

## API Routes

### Health Check

```
GET /api/health
```

Returns server status and version.

### Gemini Endpoints

```
POST /api/gemini/grounding
POST /api/live/token
```

- `grounding` - Proxies Maps grounding requests to Gemini API
- `token` - Generates ephemeral tokens for Gemini Live WebSocket connections

### Maps Endpoints

```
GET /api/maps/place-details?place_id=<id>
GET /api/maps/place-photo?photo_name=<name>&maxWidthPx=<width>&maxHeightPx=<height>
```

Proxies Google Maps Places API requests to protect API key.

## Environment Variables

| Variable              | Required | Description                       |
| --------------------- | -------- | --------------------------------- |
| `GEMINI_API_KEY`      | Yes      | Gemini API key (server-side only) |
| `GOOGLE_MAPS_API_KEY` | Yes      | Google Maps API key               |
| `API_PORT`            | No       | Server port (default: 3011)       |

## Development

### Local Development

```bash
# Start API only
npm run api:dev

# Start with frontend (via Vite proxy)
npm run dev:all
```

Vite dev server proxies `/api/*` to `http://localhost:3011`.

### Docker

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f api
```

### Adding a New Route

1. Create handler in `_routes/`:

```typescript
// _routes/example.ts
import { Hono } from 'hono';

const example = new Hono();

example.get('/', c => {
  return c.json({ message: 'Hello' });
});

export { example };
```

2. Mount in `_app.ts`:

```typescript
import { example } from './_routes/example.js';
app.route('/api/example', example);
```

## Deployment

The same `_app.ts` deploys everywhere:

| Platform     | Entry Point         | Command           |
| ------------ | ------------------- | ----------------- |
| Local/Docker | `_adapters/node.ts` | `npm run api:dev` |
| Vercel       | `[[...route]].ts`   | `vercel deploy`   |
| Cloudflare   | (add adapter)       | `wrangler deploy` |
| AWS Lambda   | (add adapter)       | SAM/Serverless    |

See [deployment.md](../docs/deployment.md) for detailed guides.

## Related

- [Architecture](../docs/ARCHITECTURE.md) - System overview
- [Deployment](../docs/deployment.md) - Deployment options
- [Environments](../docs/environments.md) - Environment configuration
