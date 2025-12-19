# Environments

## Environment Overview

| Environment | Frontend              | Backend               | Database                | Purpose           |
| ----------- | --------------------- | --------------------- | ----------------------- | ----------------- |
| Development | http://localhost:3003 | http://localhost:3011 | localhost:5438 (Docker) | Local development |
| Production  | Vercel deployment     | Vercel serverless     | Managed PostgreSQL      | Live system       |

## Environment Variables

### Required in All Environments

| Variable              | Description                            |
| --------------------- | -------------------------------------- |
| `GEMINI_API_KEY`      | Gemini API key for voice conversations |
| `GOOGLE_MAPS_API_KEY` | Google Maps Platform API key           |
| `DATABASE_URL`        | PostgreSQL connection string           |

### Optional

| Variable            | Description                           |
| ------------------- | ------------------------------------- |
| `API_PORT`          | Backend port (default: 3011)          |
| `POSTGRES_PORT`     | Local PostgreSQL port (default: 5438) |
| `POSTGRES_USER`     | Local database username               |
| `POSTGRES_PASSWORD` | Local database password               |
| `POSTGRES_DB`       | Local database name                   |
| `CLIENT_ID`         | OAuth 2.0 Client ID (future auth)     |
| `CLIENT_SECRET`     | OAuth 2.0 Client Secret (future auth) |

## Configuration Differences

| Config      | Development                        | Production                   |
| ----------- | ---------------------------------- | ---------------------------- |
| API Keys    | `.env` file                        | Vercel environment variables |
| API Server  | Node.js (localhost:3011)           | Vercel serverless functions  |
| Database    | Docker PostgreSQL (localhost:5438) | Managed PostgreSQL           |
| Source Maps | Enabled                            | Disabled                     |
| Hot Reload  | Yes                                | No                           |

## Database Connection

### Development

```
DATABASE_URL=postgresql://chatmaps:chatmaps_dev_password@localhost:5438/chatmaps
```

### Production

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

See [DATABASE.md](./DATABASE.md) for local setup and [DEPLOYMENT_DATABASE.md](./DEPLOYMENT_DATABASE.md) for production options.

## Security Notes

- Never commit `.env` to version control
- Restrict API keys in Google Cloud Console
- Set HTTP referrer restrictions for production keys
- Use `sslmode=require` for production database connections
- Store secrets using environment variables or secrets management
