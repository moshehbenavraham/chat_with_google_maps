# Authentication Documentation

This document describes the authentication system for the Chat with Google Maps application, powered by [Better Auth](https://better-auth.com/).

## Overview

The application uses Better Auth for authentication with the following features:

- Email and password authentication
- Cookie-based session management
- PostgreSQL database storage via Drizzle ORM
- Secure httpOnly cookies

## Architecture

```
+------------------------------------------------------------------+
|                     Authentication Flow                            |
+------------------------------------------------------------------+
|                                                                    |
|   Client (React)                                                   |
|   +----------------------------------------------------------+    |
|   | better-auth/react client                                  |    |
|   | - useSession() hook                                       |    |
|   | - signIn(), signUp(), signOut() methods                   |    |
|   +----------------------------------------------------------+    |
|                           |                                        |
|                           v                                        |
|   API Server (Hono)                                                |
|   +----------------------------------------------------------+    |
|   | /api/auth/* routes                                        |    |
|   | - CORS enabled for frontend                               |    |
|   | - Credentials (cookies) allowed                           |    |
|   +----------------------------------------------------------+    |
|                           |                                        |
|                           v                                        |
|   Better Auth                                                      |
|   +----------------------------------------------------------+    |
|   | betterAuth({                                              |    |
|   |   database: drizzleAdapter(db, { provider: 'pg' }),       |    |
|   |   emailAndPassword: { enabled: true },                    |    |
|   |   session: { cookieCache: { enabled: true } }             |    |
|   | })                                                        |    |
|   +----------------------------------------------------------+    |
|                           |                                        |
|                           v                                        |
|   PostgreSQL                                                       |
|   +----------------------------------------------------------+    |
|   | users | sessions | accounts | verifications               |    |
|   +----------------------------------------------------------+    |
|                                                                    |
+------------------------------------------------------------------+
```

## Database Schema

### Users Table

Stores user profile information.

| Column         | Type      | Description               |
| -------------- | --------- | ------------------------- |
| id             | text      | Primary key (UUID)        |
| email          | text      | User email (unique)       |
| email_verified | boolean   | Email verification status |
| name           | text      | Display name              |
| image          | text      | Profile image URL         |
| created_at     | timestamp | Creation timestamp        |
| updated_at     | timestamp | Last update timestamp     |

### Sessions Table

Stores active user sessions.

| Column     | Type      | Description          |
| ---------- | --------- | -------------------- |
| id         | text      | Primary key (UUID)   |
| user_id    | text      | Foreign key to users |
| expires_at | timestamp | Session expiration   |
| created_at | timestamp | Creation timestamp   |

### Accounts Table

Stores authentication provider accounts (email/password, OAuth).

| Column        | Type | Description                           |
| ------------- | ---- | ------------------------------------- |
| id            | text | Primary key (UUID)                    |
| user_id       | text | Foreign key to users                  |
| account_id    | text | Provider's account ID                 |
| provider_id   | text | Provider name (e.g., 'credential')    |
| password      | text | Hashed password (credential provider) |
| access_token  | text | OAuth access token                    |
| refresh_token | text | OAuth refresh token                   |
| ...           |      | Additional OAuth fields               |

### Verifications Table

Stores verification tokens for email verification and password reset.

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | text      | Primary key (UUID)    |
| identifier | text      | Email being verified  |
| value      | text      | Verification token    |
| expires_at | timestamp | Token expiration      |
| created_at | timestamp | Creation timestamp    |
| updated_at | timestamp | Last update timestamp |

## Environment Variables

### Required Variables

```bash
# Secret key for signing cookies and tokens
# Must be at least 32 characters
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long

# Base URL for auth callbacks (frontend URL)
BETTER_AUTH_URL=http://localhost:5173
```

## API Endpoints

All auth endpoints are mounted at `/api/auth/*`.

### Get Session

```bash
GET /api/auth/get-session
```

Returns the current session if authenticated, otherwise returns null.

**Response (authenticated):**

```json
{
  "session": {
    "id": "session-id",
    "userId": "user-id",
    "expiresAt": "2025-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response (unauthenticated):**

```json
null
```

### Sign Up

```bash
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Sign In

```bash
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign Out

```bash
POST /api/auth/sign-out
```

## Security Configuration

### Password Requirements

- Minimum length: 8 characters

### Session Settings

- Session duration: 7 days
- Cookie cache duration: 5 minutes
- Session update interval: 24 hours

### CORS Configuration

- Credentials (cookies) enabled
- Origin: Configured via `BETTER_AUTH_URL`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Testing

### Manual Testing

1. Start the database:

   ```bash
   pnpm db:start
   ```

2. Start the dev server:

   ```bash
   pnpm api:dev
   ```

3. Test session endpoint:

   ```bash
   curl http://localhost:3011/api/auth/get-session
   # Expected: null (unauthenticated)

   curl http://localhost:3011/api/auth/ok
   # Expected: {"ok":true}
   ```

### Running Unit Tests

```bash
pnpm test
```

## Troubleshooting

### Common Issues

1. **Missing BETTER_AUTH_SECRET**
   - Error: `MissingApiKeyError: Missing required environment variable: BETTER_AUTH_SECRET`
   - Solution: Add `BETTER_AUTH_SECRET` to your `.env` file

2. **Secret Too Short**
   - Error: `BETTER_AUTH_SECRET must be at least 32 characters long`
   - Solution: Generate a new secret with `openssl rand -base64 32`

3. **CORS Errors**
   - Error: Cross-origin request blocked
   - Solution: Ensure `BETTER_AUTH_URL` matches your frontend URL

4. **Cookie Not Set**
   - Check that frontend is sending requests with `credentials: 'include'`
   - Verify CORS is properly configured

## Related Documentation

- [Better Auth Documentation](https://better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Project ARCHITECTURE.md](./ARCHITECTURE.md)
