# Application Architecture

This document outlines the architecture of the Interactive Day Planner, a web application built with React that showcases a real-time, voice-driven conversational experience using the Gemini API, grounded with data from Google Maps and visualized on a Photorealistic 3D Map.

## Overview

The application is a **React SPA + Hono Backend** with a modular architecture. The frontend handles UI, voice interaction, and 3D map rendering. The backend proxies sensitive API calls to protect credentials.

### System Diagram

```
Browser                           Backend                      External Services
+------------------+         +------------------+         +------------------+
|  React SPA       |  HTTP   |  Hono API        |  HTTPS  |  Google Services |
|  - Voice UI      |-------->|  /api/health     |-------->|  - Gemini API    |
|  - 3D Map        |         |  /api/gemini/*   |         |  - Maps API      |
|  - Chat Console  |<--------|  /api/maps/*     |<--------|                  |
+------------------+         |  /api/db/*       |         +------------------+
     :3003                   +--------+---------+
                                      |
                                      | SQL
                                      v
                             +------------------+
                             |  PostgreSQL 16   |
                             |  - users         |
                             |  - sessions      |
                             +------------------+
                                   :5438
```

### Core Technologies

**Frontend**

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - Lightweight state management
- **@vis.gl/react-google-maps** - Google Maps React integration
- **@google/genai** - Gemini API SDK

**Backend**

- **Hono** - Lightweight, vendor-neutral web framework
- **Node.js** - Runtime (also works on Bun, Deno, Cloudflare Workers)

**Database**

- **PostgreSQL 16** - Relational database (Docker for local, managed for production)
- **Drizzle ORM** - Type-safe database access with SQL-like syntax
- **postgres-js** - PostgreSQL driver for Node.js

## Project Structure

```
src/
├── main.tsx                      # Entry point (renders App to DOM)
├── App.tsx                       # Root component
├── index.css                     # Global styles
├── components/                   # React components
│   ├── ControlTray.tsx           # User input controls
│   ├── ErrorScreen.tsx           # Error display
│   ├── GroundingWidget.tsx       # Maps grounding results
│   ├── Sidebar.tsx               # Settings panel
│   ├── map-3d/                   # 3D Map feature module
│   ├── popup/                    # Popup components
│   ├── sources-popover/          # Sources display
│   └── streaming-console/        # Conversation display
├── contexts/                     # React contexts
│   └── LiveAPIContext.tsx        # Gemini Live session context
├── hooks/                        # Custom React hooks
│   └── use-live-api.ts           # Gemini Live API hook
├── stores/                       # Zustand state management
│   └── index.ts                  # All stores (settings, UI, tools, logs, map)
├── lib/                          # Utilities organized by domain
│   ├── api/                      # API clients
│   │   ├── genai-live-client.ts  # Gemini Live client wrapper
│   │   └── maps-grounding.ts     # Maps grounding API
│   ├── audio/                    # Audio processing
│   │   ├── audio-recorder.ts     # Microphone capture
│   │   ├── audio-streamer.ts     # Audio playback
│   │   └── audioworklet-registry.ts
│   ├── map/                      # Map utilities
│   │   ├── look-at.ts            # Camera positioning
│   │   └── map-controller.ts     # Map abstraction layer
│   ├── prompts/                  # AI prompt definitions
│   │   ├── index.ts              # Prompt exports
│   │   ├── types.ts              # Prompt types
│   │   ├── itinerary-planner.ts  # Default persona
│   │   └── scavenger-hunt.ts     # Easter egg persona
│   ├── tools/                    # Function calling tools
│   │   ├── tool-registry.ts      # Tool implementations
│   │   └── itinerary-planner.ts  # Tool definitions
│   ├── worklets/                 # Audio worklets
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Shared utilities
└── types/                        # Global TypeScript types
    └── index.ts                  # Type re-exports

api/                              # Backend API (Hono)
├── _app.ts                       # Route mounting (platform-agnostic)
├── _server.ts                    # Development server entry
├── [[...route]].ts               # Vercel serverless entry point
├── _adapters/                    # Platform adapters
│   ├── node.ts                   # Node.js server
│   └── vercel.ts                 # Vercel export
├── _db/                          # Database layer (Drizzle)
│   ├── client.ts                 # postgres-js connection
│   ├── index.ts                  # Drizzle instance with schema
│   └── schema/                   # Table definitions
│       ├── index.ts              # Schema barrel export
│       ├── users.ts              # Users table
│       └── sessions.ts           # Sessions table
├── _middleware/                  # Hono middleware
│   └── error-handler.ts          # Centralized error handling
├── _routes/                      # API route handlers
│   ├── health.ts                 # GET /api/health
│   ├── db.ts                     # Database test endpoints
│   ├── gemini.ts                 # Gemini API proxy
│   └── maps.ts                   # Maps API proxy
├── _lib/                         # Shared utilities
└── _tests/                       # API tests

drizzle/                          # Database migrations
├── 0000_*.sql                    # Initial schema migration
└── meta/                         # Drizzle metadata
```

## Key Files

| File                               | Purpose                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`                      | Root component that orchestrates the layout and reacts to state changes for markers, routes, and camera targets |
| `src/hooks/use-live-api.ts`        | Core Gemini Live integration - manages connection, session, and real-time events                                |
| `src/lib/api/genai-live-client.ts` | Low-level wrapper around `@google/genai` SDK with event-emitter pattern                                         |
| `src/lib/tools/tool-registry.ts`   | Function-calling tool implementations (mapsGrounding, frameEstablishingShot, frameLocations)                    |
| `src/lib/map/map-controller.ts`    | Abstraction layer for Photorealistic 3D Map interactions                                                        |
| `api/_app.ts`                      | Hono app with all routes mounted - platform-agnostic core                                                       |
| `api/_db/index.ts`                 | Drizzle ORM instance with schema - database access layer                                                        |
| `api/_db/client.ts`                | postgres-js connection with pooling configuration                                                               |
| `api/_routes/gemini.ts`            | Gemini API proxy - ephemeral tokens, grounding endpoint                                                         |
| `api/_routes/maps.ts`              | Google Maps API proxy - place details, photos, geocoding                                                        |

## Key Concepts

### Backend API Layer (Hono)

The backend provides server-side API key protection and proxies requests to Google services.

**Why server-side proxying?**

- API keys never exposed to browser DevTools
- Single point for rate limiting and error handling
- Enables future authentication integration

**API Routes:**

| Route                     | Method | Purpose                         |
| ------------------------- | ------ | ------------------------------- |
| `/api/health`             | GET    | Health check                    |
| `/api/gemini/grounding`   | POST   | Maps grounding via Gemini       |
| `/api/live/token`         | POST   | Ephemeral token for Gemini Live |
| `/api/maps/place-details` | GET    | Place details proxy             |
| `/api/maps/place-photo`   | GET    | Place photo proxy               |

**Deployment-agnostic design:**
The `api/_app.ts` is pure Hono code with no platform dependencies. Adapters in `api/_adapters/` provide platform-specific entry points (Node.js, Vercel, Cloudflare Workers).

### Database Layer (PostgreSQL + Drizzle)

The application uses PostgreSQL for persistent storage with Drizzle ORM for type-safe database access.

**Why PostgreSQL + Drizzle?**

- PostgreSQL is fully open source and self-hostable
- Drizzle provides type-safe queries with SQL-like syntax
- Same schema works in development (Docker) and production (managed)
- Prepared for Better Auth integration in Phase 03

**Database Routes:**

| Route          | Method | Purpose                     |
| -------------- | ------ | --------------------------- |
| `/api/db/test` | GET    | Database connectivity check |
| `/api/health`  | GET    | Includes database status    |

**Schema Design:**

Tables are designed for future Better Auth integration:

- `users` - User accounts (email, name, verification status)
- `sessions` - Active user sessions with expiration

See [SCHEMA.md](./SCHEMA.md) for detailed table definitions.

**Local Development:**

```bash
npm run db:start    # Start PostgreSQL Docker container
npm run db:migrate  # Apply migrations
npm run db:shell    # Connect with psql
```

### Gemini Live API

The core technology for real-time, bidirectional voice conversation. It processes audio streams from the user's microphone and returns spoken responses.

**Integration points:**

- `src/hooks/use-live-api.ts` - Session management and event handling
- `src/lib/api/genai-live-client.ts` - Connection lifecycle and message broadcasting

**Audio handling:**

- **Input**: `AudioRecorder` captures microphone input via AudioWorklet, sends PCM data to API
- **Output**: `AudioStreamer` queues and plays PCM audio responses via Web Audio API

### Maps Grounding

Allows the Gemini model to access Google Maps' real-time information for location-based questions.

**Flow:**

1. Model invokes `mapsGrounding` tool
2. `onToolCall` handler intercepts the request
3. Helper function makes a grounding call to Gemini API with `googleMaps` tool
4. Response includes `groundingMetadata` with place IDs
5. Place details fetched via Google Maps Places library
6. State updated, markers rendered on 3D map

### Photorealistic 3D Maps

The visual centerpiece using the `<gmp-map-3d>` web component.

**Camera control methods:**

1. **Direct tool commands** - `frameEstablishingShot` and `frameLocations` trigger fly-to animations
2. **Reactive state-driven framing** - Markers update state, `useEffect` calculates optimal camera position

### @vis.gl/react-google-maps

Foundation for Google Maps integration:

- `<APIProvider>` - Handles async loading of Google Maps JavaScript API
- `useMapsLibrary` hook - Safe access to specific Maps libraries after loading

## Advanced Concepts

### The `onToolCall` Handler (`src/hooks/use-live-api.ts`)

Central dispatcher for function calls from the Gemini model. Manages:

- UI loading states (`isAwaitingFunctionResponse`)
- Dynamic function lookup and execution from `toolRegistry`
- Shared `toolContext` object for tool-UI decoupling
- Result packaging for API responses

### The `mapsGrounding` Implementation (`src/lib/tools/tool-registry.ts`)

Self-contained tool demonstrating complex async workflow:

1. Initial API call for grounding data
2. Process response to extract Place IDs
3. Parallel API calls to Places library for location details
4. Global Zustand store update (`useMapStore`)

### The `lookAtWithPadding` Function (`src/lib/map/look-at.ts`)

Calculates precise camera position (`center`, `range`, `tilt`) to frame geographic points with UI padding. Uses:

- Trigonometric calculations (sine, cosine, tangent)
- Geometric transformations for screen-space to geographic offset conversion
- Camera heading rotation for offset vectors

### The `scheduleNextBuffer` Method (`src/lib/audio/audio-streamer.ts`)

Manages seamless playback of raw audio chunks using Web Audio API:

- Manual buffer queue management
- Precise scheduling time calculations
- Timer-based processing without main thread blocking

### The `src/components/map-3d/` Directory

React wrapper for `<gmp-map-3d>` web component using advanced patterns:

- **Type Augmentation** (`map-3d-types.ts`) - Declaration merging for `@vis.gl/react-google-maps`
- **Ref Forwarding** (`map-3d.tsx`) - `forwardRef` and `useImperativeHandle` for controlled DOM access
- **Microtask Batching** (`use-map-3d-camera-events.ts`) - `queueMicrotask` for performance optimization

## State Management

The app uses **Zustand** for global state (`src/stores/index.ts`):

- UI state
- Conversation logs
- Settings
- Map state (markers, routes, camera targets)

## Related Documentation

- [Prompts Guide](./PROMPTS.md) - System prompt management
- [Local Deployment](./LOCAL_DEPLOYMENT.md) - Development setup
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Production hosting
- [Customization Guide](./CUSTOMIZATION.md) - Extending the application
- [Database Setup](./DATABASE.md) - Local PostgreSQL setup
- [Database Deployment](./DEPLOYMENT_DATABASE.md) - Production database options
- [Schema Reference](./SCHEMA.md) - Table definitions and conventions
