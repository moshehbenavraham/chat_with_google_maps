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

### 4. Required API Keys

| Variable              | Where to Get                                                                          | Description                |
| --------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| `GEMINI_API_KEY`      | [Google AI Studio](https://aistudio.google.com/app/apikey)                            | Powers voice conversations |
| `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) | Map rendering and APIs     |

### 5. Enable Google Maps APIs

In Google Cloud Console, enable:

- Maps JavaScript API
- Places API (New)
- Geocoding API
- Maps Elevation API
- Maps Grounding API

### 6. Start Development

```bash
npm run dev
```

### 7. Verify Setup

- [ ] App runs at `http://localhost:3000`
- [ ] Tests pass: `npm run test`
- [ ] Quality checks pass: `npm run quality`
- [ ] 3D map loads and responds to voice

## Common Issues

### Port 3000 in use

Vite auto-increments to 3001, 3002, etc. Check terminal output for actual port.

### Map not loading

Verify `GOOGLE_MAPS_API_KEY` in `.env` and that required APIs are enabled in Cloud Console.

### Voice not working

Verify `GEMINI_API_KEY` in `.env` and that microphone permissions are granted in browser.

## Next Steps

- [Development Guide](./development.md) - Dev scripts and workflow
- [Architecture](./ARCHITECTURE.md) - System design
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines
