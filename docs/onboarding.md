# Onboarding

Zero-to-hero checklist for new developers.

## Prerequisites

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v8+ installed (`npm --version`)
- [ ] Git installed
- [ ] [Gemini API Key](https://aistudio.google.com/app/apikey)
- [ ] [Google Maps API Key](https://console.cloud.google.com/google/maps-apis/credentials)

## Setup Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd chat_with_google_maps
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Required Environment Variables

| Variable              | Where to Get                                                                          | Description                |
| --------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| `GEMINI_API_KEY`      | [Google AI Studio](https://aistudio.google.com/app/apikey)                            | Powers voice conversations |
| `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) | Map rendering and APIs     |
| `DATABASE_URL`        | See [DATABASE.md](./DATABASE.md)                                                      | PostgreSQL connection      |
| `BETTER_AUTH_SECRET`  | Generate: `openssl rand -base64 32`                                                   | Auth secret (min 32 chars) |
| `BETTER_AUTH_URL`     | `http://localhost:5173` for dev                                                       | Frontend URL for auth      |

### 5. Enable Google Maps APIs

In Google Cloud Console, enable:

- Maps JavaScript API
- Places API (New)
- Geocoding API
- Maps Elevation API
- Maps Grounding API

### 6. Start Database

```bash
npm run db:start
npm run db:migrate
```

### 7. Start Langfuse (Optional)

```bash
npm run langfuse:start
```

Dashboard available at http://localhost:3016 (first run requires account creation).

### 8. Start Development

```bash
npm run dev
```

### 9. Verify Setup

- [ ] App runs at `http://localhost:3003`
- [ ] Tests pass: `npm run test`
- [ ] Quality checks pass: `npm run quality`
- [ ] 3D map loads and responds to voice
- [ ] Can sign up and sign in
- [ ] Langfuse dashboard at http://localhost:3016 (if started)

## Common Issues

### Port 3003 in use

Vite auto-increments to 3004, 3005, etc. Check terminal output for actual port.

### Map not loading

Verify `GOOGLE_MAPS_API_KEY` in `.env` and that required APIs are enabled in Cloud Console.

### Voice not working

Verify `GEMINI_API_KEY` in `.env` and that microphone permissions are granted in browser.

## Next Steps

- [Development Guide](./development.md) - Dev scripts and workflow
- [Architecture](./ARCHITECTURE.md) - System design
- [Authentication](./AUTH.md) - Auth setup and usage
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines
