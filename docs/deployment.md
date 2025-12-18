# Deployment Guide

This guide covers deploying the Chat with Google Maps application to various platforms.

## Overview

The application uses a **deployment-agnostic architecture** that allows the same codebase to run on:

- **Vercel** - Serverless deployment (recommended for quick setup)
- **Docker** - Self-hosted deployment (full control)
- **Other platforms** - Cloudflare Workers, AWS Lambda, Bun, etc.

### Architecture

```
api/
  app.ts              # Pure Hono app (routes, middleware) - NO platform code
  index.ts            # Development entry point
  adapters/
    node.ts           # @hono/node-server for local dev & Docker
    vercel.ts         # Vercel serverless export
  [[...route]].ts     # Vercel catch-all entry point

Dockerfile            # Self-hosted container build
docker-compose.yml    # Self-hosted orchestration
```

The same `app.ts` deploys everywhere - only the adapter changes.

---

## Environment Variables

Both deployment methods require these environment variables:

| Variable              | Required | Description                     |
| --------------------- | -------- | ------------------------------- |
| `GEMINI_API_KEY`      | Yes      | Google Gemini API key           |
| `GOOGLE_MAPS_API_KEY` | Yes      | Google Maps API key             |
| `API_PORT`            | No       | API server port (default: 3011) |

**Important**: Never commit API keys to version control. Use environment variables or secrets management.

---

## Option 1: Vercel Deployment (Recommended)

Vercel provides the fastest path to production with zero infrastructure management.

See [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Quick Start

```bash
# Install Vercel CLI
npm install -g vercel

# Link to project (first time)
vercel link

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add GOOGLE_MAPS_API_KEY

# Deploy to production
vercel --prod
```

### Verify Deployment

```bash
curl https://your-project.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"...","version":"..."}
```

---

## Option 2: Docker Self-Hosted Deployment

Docker provides full control over your infrastructure.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### Quick Start

1. Create a `.env` file with your API keys:

```bash
# .env
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

2. Build and run:

```bash
# Using Docker Compose (recommended)
docker compose up -d

# Or using npm scripts
npm run docker:build
npm run docker:run
```

3. Verify deployment:

```bash
curl http://localhost:3011/api/health
```

### Production Deployment with Docker

For production self-hosted deployment:

1. Use a container orchestration platform (Docker Swarm, Kubernetes)
2. Set up a reverse proxy (nginx, Traefik) for SSL termination
3. Use secrets management for API keys
4. Configure health checks for auto-restart

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 3: Alternative Platforms

The Hono framework supports many platforms. Here are guides for common alternatives:

### Cloudflare Workers

1. Install the Cloudflare adapter:

```bash
npm install @hono/cloudflare-workers
```

2. Create `api/adapters/cloudflare.ts`:

```typescript
import { app } from '../app.js';
export default app;
```

3. Configure `wrangler.toml` and deploy with `wrangler deploy`

### AWS Lambda

1. Install the AWS Lambda adapter:

```bash
npm install @hono/aws-lambda
```

2. Create `api/adapters/lambda.ts`:

```typescript
import { handle } from '@hono/aws-lambda';
import { app } from '../app.js';
export const handler = handle(app);
```

3. Deploy using AWS SAM, Serverless Framework, or CDK

### Bun

Hono works natively with Bun:

```bash
bun run api/adapters/node.ts
```

---

## Troubleshooting

### Common Issues

#### 1. API returns 404 for all routes

**Cause**: API routing not configured correctly.

**Solution**: Verify `vercel.json` has the API rewrite rule before the SPA catch-all:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 2. Environment variables not accessible

**Vercel Solution**:

```bash
vercel env add GEMINI_API_KEY
vercel env add GOOGLE_MAPS_API_KEY
# Then redeploy
```

**Docker Solution**:
Ensure `.env` file exists or pass variables in `docker-compose.yml`

#### 3. CORS errors in browser

**Cause**: API and frontend on different domains without CORS headers.

**Solution**: For same-origin requests, Hono handles this automatically. For cross-origin, add CORS middleware:

```typescript
import { cors } from 'hono/cors';
app.use('*', cors());
```

#### 4. Docker build fails with husky error

**Cause**: The `prepare` script tries to run husky during `npm ci`.

**Solution**: The Dockerfile uses `--ignore-scripts` flag to prevent this.

#### 5. API key exposed in browser network tab

**Cause**: Frontend is calling external APIs directly.

**Solution**: All external API calls should go through the backend proxy:

- `/api/gemini/*` - Gemini API proxy
- `/api/maps/*` - Google Maps API proxy

### Health Check

Test your deployment health:

```bash
# Vercel
curl https://your-project.vercel.app/api/health

# Docker
curl http://localhost:3011/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-01T00:00:00.000Z","version":"0.0.7"}
```

### Logs

**Vercel**: View logs at `https://vercel.com/your-project/logs`

**Docker**:

```bash
docker compose logs -f api
```

---

## Security Checklist

Before deploying to production:

- [ ] API keys stored as environment variables (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] HTTPS enabled (Vercel handles this automatically)
- [ ] Rate limiting configured for API endpoints
- [ ] Error messages don't leak sensitive information
- [ ] Health endpoint doesn't expose internal details

---

## Related Documentation

- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Detailed Vercel setup
- [Local Deployment](./LOCAL_DEPLOYMENT.md) - Local development setup
- [Environments](./environments.md) - Environment configuration
