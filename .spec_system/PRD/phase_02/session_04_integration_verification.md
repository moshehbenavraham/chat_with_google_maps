# Session 04: Integration & Verification

**Session ID**: `phase02-session04-integration-verification`
**Status**: Not Started
**Estimated Tasks**: ~18
**Estimated Duration**: 2-3 hours

---

## Objective

Integrate the database layer with the Hono API, create verification endpoints, and ensure the complete database stack works in both development and production environments.

---

## Scope

### In Scope (MVP)
- Create `/api/db/test` endpoint to verify database connectivity
- Integrate database into existing Hono application
- Add database health check to `/api/health` endpoint
- Test database operations (CRUD) via API
- Verify migrations work in fresh database
- Update deployment documentation
- Test Docker Compose full-stack setup
- Document production PostgreSQL options

### Out of Scope
- Production database provisioning
- Database backups and recovery procedures
- Performance optimization
- Connection monitoring and alerting

---

## Prerequisites

- [ ] Session 03 complete (schema and migrations applied)
- [ ] Database running with tables created
- [ ] Understanding of Hono middleware

---

## Deliverables

1. `/api/routes/db-test.ts` - Database test endpoint
2. Updated `/api/routes/health.ts` - Database health check
3. Updated `docker-compose.yml` - Full-stack configuration
4. `docs/DEPLOYMENT_DATABASE.md` - Production database guide
5. Database integration tests

---

## Technical Details

### Database Test Endpoint

```typescript
// api/routes/db-test.ts
import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { sql } from 'drizzle-orm';

const dbTest = new Hono();

// Test database connectivity
dbTest.get('/', async (c) => {
  try {
    // Simple query to verify connection
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    return c.json({
      status: 'connected',
      timestamp: result[0].current_time,
      tables: {
        users: true,
        sessions: true,
      },
    });
  } catch (error) {
    return c.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export default dbTest;
```

### Enhanced Health Check

```typescript
// api/routes/health.ts (updated)
import { Hono } from 'hono';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const health = new Hono();

health.get('/', async (c) => {
  let dbStatus = 'unknown';

  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  return c.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    services: {
      database: dbStatus,
    },
  });
});

export default health;
```

### Docker Compose Full Stack

```yaml
# docker-compose.yml (updated)
services:
  postgres:
    image: postgres:16-alpine
    container_name: chat_maps_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dev_password}
      POSTGRES_DB: ${POSTGRES_DB:-chat_maps}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-app}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API server for self-hosted deployment
  api:
    build:
      context: .
      dockerfile: Dockerfile
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-app}:${POSTGRES_PASSWORD:-dev_password}@postgres:5432/${POSTGRES_DB:-chat_maps}
    ports:
      - "3011:3001"

volumes:
  pgdata:
```

### Production Database Options

| Option | Pros | Cons | Use When |
|--------|------|------|----------|
| **Docker PostgreSQL** | Full control, portable | Self-managed | VPS, dedicated server |
| **Bare metal PostgreSQL** | Maximum performance | Complex setup | High-scale production |
| **Neon** | Serverless, branching | Managed service | Quick production setup |
| **Supabase** | Full platform | Managed service | Need more than just DB |

---

## Success Criteria

- [ ] `/api/db/test` endpoint returns database status
- [ ] `/api/health` includes database connectivity check
- [ ] Database operations work through Hono routes
- [ ] Fresh database setup works (docker down -v, up, migrate)
- [ ] Full docker-compose stack starts successfully
- [ ] Production deployment options documented
- [ ] Integration tests pass for database operations
- [ ] All quality gates passing (TypeScript, ESLint, tests)
- [ ] README updated with database setup instructions
