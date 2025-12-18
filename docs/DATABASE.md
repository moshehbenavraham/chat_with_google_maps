# Local Development Database

This guide covers the PostgreSQL database setup for local development using Docker.

## Overview

The project uses PostgreSQL 16 (Alpine) for data persistence. The database runs in Docker for a consistent, reproducible development environment that mirrors production without requiring cloud services during development.

**Quick Reference:**

- **Image**: `postgres:16-alpine`
- **Container name**: `chat_maps_db`
- **Default port**: 5438 (assigned in PORT-MAP)
- **Volume**: `chat_maps_pgdata` (persistent data)

---

## Prerequisites

Before using the database, ensure you have:

1. **Docker Desktop** or **Docker Engine** installed

   ```bash
   docker --version   # Should show Docker version 20+
   ```

2. **Docker Compose V2** available

   ```bash
   docker compose version   # Should show Docker Compose v2+
   ```

3. **Port 5438 available** (or configure a different port)
   ```bash
   # Check if port 5438 is in use
   lsof -i :5438 || netstat -an | grep 5438
   ```

---

## Quick Start

1. **Copy environment variables** (if not done already):

   ```bash
   cp .env.example .env
   ```

2. **Start the database**:

   ```bash
   npm run db:start
   ```

3. **Verify it's running**:

   ```bash
   docker compose ps
   # Should show chat_maps_db with status "healthy"
   ```

4. **Connect to the database**:
   ```bash
   npm run db:shell
   # Opens psql prompt
   ```

---

## NPM Scripts

All database operations use npm scripts for convenience:

| Script             | Description                         | Example            |
| ------------------ | ----------------------------------- | ------------------ |
| `npm run db:start` | Start the database container        | `npm run db:start` |
| `npm run db:stop`  | Stop the database (preserves data)  | `npm run db:stop`  |
| `npm run db:reset` | Delete all data and start fresh     | `npm run db:reset` |
| `npm run db:logs`  | View database logs (follows output) | `npm run db:logs`  |
| `npm run db:shell` | Open psql interactive shell         | `npm run db:shell` |

### Script Details

**db:start**
Starts PostgreSQL in detached mode. The database is ready when the health check passes (usually 10-15 seconds).

**db:stop**
Gracefully stops the container but keeps the data volume intact. Use this when you're done working but want to keep your data.

**db:reset**
Destroys the container and data volume, then starts fresh. Use this when you need a clean database state.

**db:logs**
Follows the PostgreSQL container logs in real-time. Press `Ctrl+C` to exit.

**db:shell**
Opens an interactive psql session connected to the database. Use `\q` to exit.

---

## Environment Variables

Configure the database via environment variables in `.env`:

```bash
# PostgreSQL credentials
POSTGRES_USER=chatmaps
POSTGRES_PASSWORD=chatmaps_dev_password
POSTGRES_DB=chatmaps

# Port configuration (5438 assigned in PORT-MAP)
POSTGRES_PORT=5438

# Connection string for application code and ORMs
DATABASE_URL=postgresql://chatmaps:chatmaps_dev_password@localhost:5438/chatmaps
```

**Note**: Default values are used if environment variables are not set. The defaults are suitable for local development only.

---

## Connection String

The `DATABASE_URL` format for PostgreSQL is:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

For local development:

```
postgresql://chatmaps:chatmaps_dev_password@localhost:5438/chatmaps
```

When the API runs inside Docker alongside the database:

```
postgresql://chatmaps:chatmaps_dev_password@db:5432/chatmaps
```

---

## Local Customization

For machine-specific configuration, create `docker-compose.override.yml`:

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
```

Common customizations:

**Change the exposed port**:

```yaml
services:
  db:
    ports:
      - '5439:5432' # Use port 5439 instead (check PORT-MAP for availability)
```

**Enable query logging**:

```yaml
services:
  db:
    command: postgres -c log_statement=all
```

**Limit container resources**:

```yaml
services:
  db:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## Troubleshooting

### Port 5438 is already in use

Another process is using port 5438.

**Option 1**: Stop the conflicting process

```bash
# Find the process
lsof -i :5438 || netstat -an | grep 5438
```

**Option 2**: Use a different port

```bash
# In .env (check PORT-MAP for available ports)
POSTGRES_PORT=5439

# Update DATABASE_URL to match
DATABASE_URL=postgresql://chatmaps:chatmaps_dev_password@localhost:5439/chatmaps
```

### Docker is not running

If you see "Cannot connect to the Docker daemon":

```bash
# Start Docker Desktop (macOS/Windows)
open -a Docker   # macOS
# Or start from the system tray

# Start Docker daemon (Linux)
sudo systemctl start docker
```

### Permission denied (Linux)

If you get permission errors on Linux:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker
```

### Container won't start

Check the logs for errors:

```bash
docker compose logs db
```

Common issues:

- Invalid environment variable values
- Corrupted data volume (try `npm run db:reset`)

### Health check failing

If the container is "unhealthy":

1. Check if PostgreSQL started:

   ```bash
   docker compose logs db | grep "ready to accept connections"
   ```

2. Verify credentials match:

   ```bash
   # These should match in .env
   POSTGRES_USER=chatmaps
   POSTGRES_PASSWORD=chatmaps_dev_password
   POSTGRES_DB=chatmaps
   ```

3. Try resetting:
   ```bash
   npm run db:reset
   ```

### Data not persisting

Ensure you're using `db:stop` (not `db:reset`) when you want to keep data:

```bash
# Keeps data
npm run db:stop

# Destroys data
npm run db:reset
```

---

## Verifying Data Persistence

Test that data persists across container restarts:

```bash
# Start the database
npm run db:start

# Wait for healthy status
docker compose ps

# Create a test table and insert data
npm run db:shell
# In psql:
CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT);
INSERT INTO test (name) VALUES ('persistence check');
SELECT * FROM test;
\q

# Stop and restart
npm run db:stop
npm run db:start

# Verify data still exists
npm run db:shell
# In psql:
SELECT * FROM test;
# Should show: 1 | persistence check
DROP TABLE test;
\q
```

---

## Next Steps

After database setup is complete:

1. **Drizzle ORM Configuration** - Session 02 will add Drizzle for type-safe database access
2. **Schema Migrations** - Session 03 will create the application database schema
3. **Integration Testing** - Session 04 will verify the full database stack
