# Production Database Deployment Guide

This guide covers deploying PostgreSQL for production environments. The project maintains a vendor-neutral philosophy, allowing you to choose the PostgreSQL provider that best fits your needs.

## Overview

The application uses PostgreSQL 16 with Drizzle ORM. In production, you need:

1. A PostgreSQL 16+ instance (hosted or self-managed)
2. The `DATABASE_URL` environment variable configured
3. Database migrations applied

**Quick Reference:**

- **Required version**: PostgreSQL 16+
- **ORM**: Drizzle ORM with postgres-js driver
- **Connection pooling**: Built into postgres-js (recommended: 10 connections max)

---

## Hosted PostgreSQL Options

### Managed Database Services

The following providers offer managed PostgreSQL with minimal operational overhead:

| Provider                                                            | Free Tier      | Notes                                 |
| ------------------------------------------------------------------- | -------------- | ------------------------------------- |
| [Neon](https://neon.tech)                                           | Yes (generous) | Serverless, scales to zero, branching |
| [Supabase](https://supabase.com)                                    | Yes            | Includes auth and realtime features   |
| [Railway](https://railway.app)                                      | Limited        | Simple setup, good DX                 |
| [Render](https://render.com)                                        | Limited        | Automatic backups included            |
| [DigitalOcean](https://digitalocean.com/products/managed-databases) | No             | Managed with automatic failover       |
| [AWS RDS](https://aws.amazon.com/rds/postgresql/)                   | No             | Enterprise-grade, multi-AZ            |
| [Google Cloud SQL](https://cloud.google.com/sql/postgresql)         | No             | GCP integration                       |
| [Azure Database](https://azure.microsoft.com/services/postgresql/)  | No             | Azure integration                     |

### Choosing a Provider

**For serverless deployments (Vercel, Cloudflare):**

- Neon or Supabase work well due to their serverless-friendly connection handling
- Both support connection pooling suitable for edge functions

**For container deployments (Railway, Fly.io):**

- Any managed PostgreSQL works well
- Consider co-locating database and app in the same region

**For self-hosted:**

- Docker Compose (see below)
- Kubernetes with PostgreSQL operator
- Bare metal with pg_basebackup for replication

---

## Connection String Format

The `DATABASE_URL` environment variable uses the standard PostgreSQL connection string format:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Example (Neon):**

```
postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/chatmaps?sslmode=require
```

**Example (Supabase):**

```
postgresql://postgres:password@db.abcdefghij.supabase.co:5432/postgres?sslmode=require
```

### SSL Mode

For production, always use `sslmode=require` or `sslmode=verify-full`:

```
postgresql://user:pass@host:5432/db?sslmode=require
```

---

## Running Migrations

Before the application can function, database migrations must be applied.

### Local Machine (Recommended for Initial Setup)

```bash
# Set the production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Run migrations
npm run db:migrate
```

### CI/CD Pipeline

Add a migration step to your deployment pipeline:

```yaml
# Example GitHub Actions step
- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run db:migrate
```

### Vercel Deployment

For Vercel deployments, migrations should be run before or during deployment:

**Option 1: Local Migration (Simplest)**

```bash
# Run from your local machine with production DATABASE_URL
DATABASE_URL="your-production-url" npm run db:migrate
```

**Option 2: Vercel Build Hook**
Add to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run db:migrate && npm run build"
  }
}
```

Note: This runs migrations on every deployment, which is safe (migrations are idempotent).

---

## Verifying Database Connectivity

After deployment, verify the database is accessible:

### Health Check Endpoint

```bash
curl https://your-app.example.com/api/health
```

Expected response when database is connected:

```json
{
  "status": "ok",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "version": "0.0.7",
  "services": {
    "database": "connected"
  }
}
```

If database is unreachable:

```json
{
  "status": "degraded",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "version": "0.0.7",
  "services": {
    "database": "disconnected"
  }
}
```

### Database Test Endpoint

For more detailed diagnostics:

```bash
curl https://your-app.example.com/api/db/test
```

Expected response:

```json
{
  "status": "connected",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "tables": {
    "users": true,
    "sessions": true
  }
}
```

---

## Self-Hosted PostgreSQL

### Docker Compose (Simple)

For VPS or dedicated server deployments, use Docker Compose:

```yaml
# docker-compose.production.yml
services:
  db:
    image: postgres:16-alpine
    container_name: chatmaps_db_prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '127.0.0.1:5432:5432' # Only bind to localhost
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Important security notes:**

- Bind to `127.0.0.1` to prevent external access
- Use strong passwords (32+ characters)
- Set up firewall rules
- Enable SSL for non-localhost connections

### Backup Strategy

For self-hosted PostgreSQL, implement a backup strategy:

```bash
# Create backup
pg_dump -h localhost -U chatmaps -d chatmaps -F c -f backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -h localhost -U chatmaps -d chatmaps backup_20251219.dump
```

Consider automated backups with:

- Cron jobs + cloud storage (S3, GCS)
- pg_basebackup for point-in-time recovery
- Managed backup solutions

---

## Connection Pooling

The postgres-js driver handles connection pooling automatically. Default configuration:

```typescript
// From api/_db/client.ts
const POOL_CONFIG = {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
};
```

### Serverless Considerations

For serverless deployments (Vercel, Cloudflare Workers):

1. **Use external connection poolers** if your provider supports them:
   - Neon: Built-in connection pooling
   - Supabase: PgBouncer available
   - AWS RDS Proxy: For AWS deployments

2. **Keep pool size small** (5-10 connections) since each serverless instance gets its own pool

3. **Use connection string parameters**:
   ```
   postgresql://user:pass@host:5432/db?pool_timeout=0&connect_timeout=10
   ```

---

## Environment Variables

### Required

| Variable       | Description                  | Example                               |
| -------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Optional (for local development)

| Variable            | Description           | Default                 |
| ------------------- | --------------------- | ----------------------- |
| `POSTGRES_USER`     | Database username     | `chatmaps`              |
| `POSTGRES_PASSWORD` | Database password     | `chatmaps_dev_password` |
| `POSTGRES_DB`       | Database name         | `chatmaps`              |
| `POSTGRES_PORT`     | Port for local Docker | `5438`                  |

---

## Troubleshooting

### Connection Refused

**Symptoms:** `ECONNREFUSED` or "Connection refused" errors

**Causes:**

- Database not running
- Wrong host/port in connection string
- Firewall blocking connection

**Solutions:**

1. Verify database is running
2. Check connection string matches provider's format
3. Ensure IP allowlist includes your server's IP

### SSL Required

**Symptoms:** "SSL connection is required" error

**Solution:** Add `?sslmode=require` to your connection string:

```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Too Many Connections

**Symptoms:** "too many connections" error

**Causes:**

- Connection pool too large
- Connections not being released
- Multiple serverless instances each creating pools

**Solutions:**

1. Reduce `max` pool size
2. Use external connection pooler (PgBouncer, Neon pooler)
3. Ensure `closeDb()` is called on shutdown

### Migrations Failed

**Symptoms:** Migration errors during deployment

**Solutions:**

1. Run migrations locally first to verify:
   ```bash
   DATABASE_URL="production-url" npm run db:migrate
   ```
2. Check migration files for syntax errors
3. Verify database user has CREATE TABLE permissions

---

## Security Best Practices

1. **Use strong passwords**: Generate with `openssl rand -base64 32`
2. **Enable SSL**: Always use `sslmode=require` in production
3. **Rotate credentials**: Change passwords periodically
4. **Limit access**: Use IP allowlists where available
5. **Monitor connections**: Set up alerts for connection exhaustion
6. **Audit access**: Enable logging for production databases

---

## Related Documentation

- [DATABASE.md](./DATABASE.md) - Local development database setup
- [SCHEMA.md](./SCHEMA.md) - Database schema documentation
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Vercel deployment guide
- [LOCAL_DEPLOYMENT.md](./LOCAL_DEPLOYMENT.md) - Local deployment guide
