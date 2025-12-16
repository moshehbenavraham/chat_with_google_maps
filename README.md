# Chat with Google Maps

A voice-driven conversational interface for exploring locations using Gemini Live API and Photorealistic 3D Maps.

> **Note:** This sample app is for illustration only. Review the applicable [Terms of Service](https://cloud.google.com/terms) for your region before use.

## Features

- Real-time voice conversations with Gemini AI
- Photorealistic 3D map visualization
- Location grounding with Google Maps data
- Interactive itinerary planning

## Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd chat_with_google_maps
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Run
npm run dev
```

Open http://localhost:3000

## Prerequisites

- Node.js 18+
- [Gemini API Key](https://aistudio.google.com/app/apikey)
- [Google Maps API Key](https://console.cloud.google.com/google/maps-apis/credentials)

### Required Google Maps APIs

Enable these in your Google Cloud Console:
- Maps JavaScript API
- Places API (New)
- Geocoding API
- Maps Elevation API
- Maps Grounding API

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Gemini API key for voice conversations |
| `GOOGLE_MAPS_API_KEY` | Yes | Google Maps Platform API key |
| `CLIENT_ID` | No | OAuth 2.0 Client ID |
| `CLIENT_SECRET` | No | OAuth 2.0 Client Secret |

See [.env.example](.env.example) for detailed configuration.

## Documentation

| Guide | Description |
|-------|-------------|
| [Local Deployment](./docs/LOCAL_DEPLOYMENT.md) | Development setup and troubleshooting |
| [Vercel Deployment](./docs/VERCEL_DEPLOYMENT.md) | Production hosting on Vercel |
| [Architecture](./docs/ARCHITECTURE.md) | Application structure and key concepts |
| [Customization](./docs/CUSTOMIZATION.md) | Creating personas and adding tools |
| [Prompts](./docs/PROMPTS.md) | System prompt management |
| [Contributing](./CONTRIBUTING.md) | Development workflow and guidelines |

## Project Status

See [PRD](.spec_system/PRD/PRD.md) for current progress and roadmap.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Tech Stack

- React + TypeScript
- Vite
- Zustand (state management)
- @vis.gl/react-google-maps
- @google/genai (Gemini SDK)

## Attribution

Based on Google's AI Studio Maps demo. Original code Copyright 2024 Google LLC, licensed under [Apache 2.0](./LICENSE.md).

For more information on the original project and Google's Maps + Gemini integration:
- [Grounding with Google Maps Announcement](https://blog.google/technology/developers/grounding-google-maps-gemini-api/)
- [Google AI Studio Starter Apps](https://github.com/google-gemini/aistudio-showcase)
