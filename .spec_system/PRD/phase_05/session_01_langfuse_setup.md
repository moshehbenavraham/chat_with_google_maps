# Session 01: Langfuse Setup & Docker Deployment

**Session ID**: `phase05-session01-langfuse-setup`
**Status**: Not Started
**Estimated Tasks**: ~20-25
**Estimated Duration**: 2-4 hours

---

## Objective

Deploy Langfuse locally via Docker Compose and create the client wrapper for the Hono backend, establishing the foundation for AI observability.

---

## Scope

### In Scope (MVP)
- Add Langfuse services to `docker-compose.yml`
- Install Langfuse SDK (`langfuse` npm package)
- Create `/api/_lib/langfuse.ts` with client configuration
- Configure environment variables for Langfuse connection
- Verify Langfuse UI accessible at `http://localhost:3001`
- Create first test trace via API endpoint
- Implement graceful shutdown for trace flushing

### Out of Scope
- REST API endpoint tracing (Session 02)
- WebSocket session tracing (Session 03)
- Cost tracking and dashboard (Session 04)

---

## Prerequisites

- [ ] Phase 04 completed (Frontend Overhaul)
- [ ] Docker Compose environment operational (from Phase 02)
- [ ] Hono backend running at `/api/*` endpoints
- [ ] PostgreSQL database running via Docker

---

## Deliverables

1. Updated `docker-compose.yml` with Langfuse services
2. `langfuse` npm package installed
3. `/api/_lib/langfuse.ts` client wrapper
4. Environment variables configured (`.env.local`)
5. Test trace endpoint working
6. Langfuse dashboard accessible and receiving traces

---

## Implementation Details

### Docker Services

```yaml
# docker-compose.yml additions
services:
  langfuse-server:
    image: langfuse/langfuse:latest
    depends_on:
      - langfuse-db
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://langfuse:langfuse@langfuse-db:5432/langfuse
      - NEXTAUTH_SECRET=your-secret-key
      - SALT=your-salt
      - NEXTAUTH_URL=http://localhost:3001
      - TELEMETRY_ENABLED=false

  langfuse-db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=langfuse
      - POSTGRES_PASSWORD=langfuse
      - POSTGRES_DB=langfuse
    volumes:
      - langfuse_pgdata:/var/lib/postgresql/data

volumes:
  langfuse_pgdata:
```

### Langfuse Client Configuration

```typescript
// api/_lib/langfuse.ts
import { Langfuse } from 'langfuse';

const isDev = process.env.NODE_ENV !== 'production';

export const langfuse = new Langfuse({
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  baseUrl: process.env.LANGFUSE_BASE_URL ?? 'http://localhost:3001',
  flushAt: isDev ? 1 : 15,
  flushInterval: isDev ? 1000 : 5000,
});

// Graceful shutdown
const shutdown = async () => {
  await langfuse.shutdownAsync();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { Langfuse };
```

### Environment Variables

```env
# .env.local
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_BASE_URL=http://localhost:3001
```

---

## Success Criteria

- [ ] Langfuse Docker services running (`docker compose up`)
- [ ] Langfuse UI accessible at `http://localhost:3001`
- [ ] Langfuse SDK installed and initialized
- [ ] Client wrapper created with proper configuration
- [ ] Environment variables set up
- [ ] Test trace visible in Langfuse dashboard
- [ ] Graceful shutdown implemented (traces flushed on exit)
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
- [ ] All existing tests pass
