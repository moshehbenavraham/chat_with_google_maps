# Application Architecture

This document outlines the architecture of the Interactive Day Planner, a web application built with React that showcases a real-time, voice-driven conversational experience using the Gemini API, grounded with data from Google Maps and visualized on a Photorealistic 3D Map.

## Overview

The application is a **React-based Single Page Application (SPA)** with a modular architecture that separates concerns into distinct components, hooks, contexts, and utility libraries.

### Core Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - Lightweight state management
- **@vis.gl/react-google-maps** - Google Maps React integration
- **@google/genai** - Gemini API SDK

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
```

## Key Files

| File                               | Purpose                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`                      | Root component that orchestrates the layout and reacts to state changes for markers, routes, and camera targets |
| `src/hooks/use-live-api.ts`        | Core Gemini Live integration - manages connection, session, and real-time events                                |
| `src/lib/api/genai-live-client.ts` | Low-level wrapper around `@google/genai` SDK with event-emitter pattern                                         |
| `src/lib/tools/tool-registry.ts`   | Function-calling tool implementations (mapsGrounding, frameEstablishingShot, frameLocations)                    |
| `src/lib/map/map-controller.ts`    | Abstraction layer for Photorealistic 3D Map interactions                                                        |

## Key Concepts

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
