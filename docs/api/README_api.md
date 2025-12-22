# API Reference

Backend API documentation for Chat with Google Maps.

## Base URL

- **Development**: `http://localhost:3011/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

Most endpoints require authentication via Better Auth session cookies. Protected endpoints return `401 Unauthorized` if no valid session exists.

## Endpoints

### Health & Status

#### GET /api/health

Health check endpoint.

**Response**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "database": "connected"
}
```

### Authentication

See [AUTH.md](../AUTH.md) for detailed authentication documentation.

#### POST /api/auth/sign-up/email

Create a new user account.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

#### POST /api/auth/sign-in/email

Sign in with email and password.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### GET /api/auth/get-session

Get current user session.

**Response**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "id": "session_456",
    "expiresAt": "2025-01-22T12:00:00.000Z"
  }
}
```

#### POST /api/auth/sign-out

End the current session.

### Gemini API Proxy

#### POST /api/gemini/grounding

Query Gemini with Maps grounding.

**Request Body**

```json
{
  "prompt": "Find coffee shops near Times Square",
  "location": {
    "lat": 40.758,
    "lng": -73.9855
  }
}
```

**Response**

```json
{
  "response": "...",
  "groundingMetadata": {
    "places": [...]
  }
}
```

#### POST /api/live/token

Get ephemeral token for Gemini Live WebSocket connection.

**Response**

```json
{
  "token": "ephemeral_token_here",
  "expiresAt": "2025-01-15T12:05:00.000Z"
}
```

### Maps API Proxy

#### GET /api/maps/place-details

Get details for a place.

**Query Parameters**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `placeId` | string | Yes      | Google Place ID |

**Response**

```json
{
  "name": "Coffee Shop",
  "address": "123 Main St",
  "rating": 4.5,
  "photos": [...]
}
```

#### GET /api/maps/place-photo

Get a place photo.

**Query Parameters**

| Parameter   | Type   | Required | Description               |
| ----------- | ------ | -------- | ------------------------- |
| `photoName` | string | Yes      | Photo resource name       |
| `maxWidth`  | number | No       | Max width (default: 400)  |
| `maxHeight` | number | No       | Max height (default: 400) |

**Response**

Binary image data with appropriate Content-Type header.

### Observability

#### GET /api/observability/health

Check Langfuse connectivity.

**Response**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "components": {
    "langfuse": {
      "status": "healthy",
      "version": "2.95.11"
    }
  }
}
```

#### GET /api/observability/status

Quick status check.

**Response**

```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "langfuseConfigured": true
}
```

#### GET /api/observability/costs

Get cost aggregation for date range.

**Query Parameters**

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `start`   | string | No       | Start date (ISO) |
| `end`     | string | No       | End date (ISO)   |

**Response**

```json
{
  "period": {
    "start": "2025-01-01T00:00:00.000Z",
    "end": "2025-01-15T00:00:00.000Z"
  },
  "totalCost": 0,
  "byModel": {},
  "note": "Cost aggregation tracked in Langfuse dashboard"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                  |
| --------------------- | ----------- | ---------------------------- |
| `UNAUTHORIZED`        | 401         | No valid session             |
| `FORBIDDEN`           | 403         | Insufficient permissions     |
| `NOT_FOUND`           | 404         | Resource not found           |
| `VALIDATION_ERROR`    | 400         | Invalid request data         |
| `INTERNAL_ERROR`      | 500         | Server error                 |
| `SERVICE_UNAVAILABLE` | 503         | External service unavailable |

## Rate Limiting

API endpoints are subject to rate limiting:

- **Authenticated requests**: 100 requests per minute
- **Unauthenticated requests**: 10 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```
