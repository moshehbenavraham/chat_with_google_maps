# Session 01: PostgreSQL Setup

**Session ID**: `phase02-session01-postgresql-setup`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Set up PostgreSQL database via Docker Compose for local development with proper configuration, persistence, and developer-friendly tooling.

---

## Scope

### In Scope (MVP)
- Create `docker-compose.yml` with PostgreSQL 16 service
- Configure volume persistence for database data
- Set up environment variables for database credentials
- Create npm scripts for database lifecycle management
- Add health check for database container
- Configure `.env.example` with database variables
- Verify PostgreSQL is accessible from host machine
- Document local development database workflow

### Out of Scope
- Drizzle ORM installation (Session 02)
- Schema creation (Session 03)
- Production database configuration (Session 04)
- Database backups and recovery
- Database replication

---

## Prerequisites

- [ ] Docker and Docker Compose installed
- [ ] Phase 01 complete (Hono backend running)
- [ ] Understanding of Docker basics

---

## Deliverables

1. `docker-compose.yml` - PostgreSQL service configuration
2. `docker-compose.override.yml.example` - Local override example
3. Updated `.env.example` - Database environment variables
4. Updated `package.json` - Database management scripts
5. `docs/DATABASE.md` - Local development database guide

---

## Technical Details

### Docker Compose Configuration

```yaml
# docker-compose.yml
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

volumes:
  pgdata:
```

### Environment Variables

```bash
# .env.example additions
# Database
POSTGRES_USER=app
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=chat_maps
POSTGRES_PORT=5432
DATABASE_URL=postgresql://app:dev_password@localhost:5432/chat_maps
```

### NPM Scripts

```json
{
  "scripts": {
    "db:start": "docker compose up -d postgres",
    "db:stop": "docker compose stop postgres",
    "db:reset": "docker compose down -v && docker compose up -d postgres",
    "db:logs": "docker compose logs -f postgres",
    "db:shell": "docker compose exec postgres psql -U app -d chat_maps"
  }
}
```

---

## Success Criteria

- [ ] `docker-compose.yml` created with PostgreSQL 16 service
- [ ] Database container starts with `npm run db:start`
- [ ] Data persists between container restarts
- [ ] Environment variables properly configured
- [ ] `DATABASE_URL` connection string works
- [ ] Can connect to database via `npm run db:shell`
- [ ] Health check passes for database container
- [ ] Documentation explains local setup workflow
- [ ] `.gitignore` excludes sensitive database files
