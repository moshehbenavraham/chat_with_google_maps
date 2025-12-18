## Frontend

### Overview

React 19 + TypeScript SPA built with Vite. Renders a left chat panel, a full-screen 3D map (`<gmp-map-3d>`), a settings sidebar, and overlays (welcome popup, error screen). No client-side routing.

### Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **State**: Zustand (`src/stores/index.ts`)
- **Gemini Live**: `@google/genai` via `src/lib/api/genai-live-client.ts`
- **Maps**: `@vis.gl/react-google-maps` + Maps JS libraries (`places`, `geocoding`, `maps3d`, `elevation`)
- **UI**: `classnames`, `react-markdown` + `remark-gfm`, `@headlessui/react` (SourcesPopover only)

### Entry Points

- `index.html` → defines `#root`, loads fonts (Space Mono, Material Symbols)
- `src/main.tsx` → renders `<App />` into `#root`
- `src/App.tsx` → wraps app in `APIProvider` + `LiveAPIProvider`

### Dev Setup

| Script            | Description             |
| ----------------- | ----------------------- |
| `npm run dev`     | Frontend on `:3003`     |
| `npm run api:dev` | Backend on `:3001`      |
| `npm run dev:all` | Both (via concurrently) |

Vite proxies `/api/*` → `http://localhost:3001`.

### Environment Variables

| Variable                   | Scope       | Purpose                  |
| -------------------------- | ----------- | ------------------------ |
| `VITE_GOOGLE_MAPS_API_KEY` | Client      | Maps JS (preferred)      |
| `GOOGLE_MAPS_API_KEY`      | Client      | Maps JS (fallback)       |
| `GEMINI_API_KEY`           | Server only | Never exposed to browser |

UI fetches ephemeral tokens from `POST /api/live/token`.

### Component Tree

```
APIProvider
└─ LiveAPIProvider
   ├─ ErrorScreen
   ├─ Sidebar
   ├─ PopUp
   └─ .streaming-console
      ├─ .console-panel
      │  ├─ StreamingConsole
      │  └─ ControlTray
      └─ .map-panel
         └─ Map3D
```

### Zustand Stores

| Store         | Purpose                                               |
| ------------- | ----------------------------------------------------- |
| `useSettings` | System prompt, model, voice, persona                  |
| `useTools`    | Tool declarations for Gemini Live                     |
| `useLogStore` | Conversation turns, `isAwaitingFunctionResponse` flag |
| `useUI`       | Sidebar toggle, show system messages                  |
| `useMapStore` | Markers, camera target, `preventAutoFrame`            |

### Gemini Live Flow

1. `connect()` clears state, fetches ephemeral token from `/api/live/token`
2. Creates `GenAILiveClient(token, model)` and connects with config
3. Events: `audio` → `AudioStreamer`, `toolcall` → `toolRegistry` dispatch
4. Mic input via `AudioRecorder` → `client.sendRealtimeInput()`

Key files:

- `src/contexts/LiveAPIContext.tsx` – provides session controller
- `src/hooks/use-live-api.ts` – connection/event handling
- `src/lib/api/genai-live-client.ts` – wraps `@google/genai` live connection

### Tool System

**Declarations**: `src/lib/tools/itinerary-planner.ts`
**Implementations**: `src/lib/tools/tool-registry.ts`

`mapsGrounding` tool calls `POST /api/gemini/grounding` via `src/lib/api/maps-grounding.ts`.

### Maps Integration

- `Map3D` (`src/components/map-3d/map-3d.tsx`) wraps `<gmp-map-3d>`
- `MapController` (`src/lib/map/map-controller.ts`) handles markers + camera
- `App.tsx` auto-frames markers via `ResizeObserver` and `lookAtWithPadding()`

### Styling

Global CSS in `src/index.css` (no Tailwind, no CSS Modules).

**Key tokens**: `--Neutral-*`, `--Blue-*`, `--Green-*`, `--Red-*`, `--breakpoint-md: 768px`

**Component CSS**: `PopUp.css`, `sources-popover.css`

**Layout**: Dark UI shell over light map. Left console overlays map (glass effect on mobile). Chat bubbles: agent (light), user (blue).

### Quick Reference

| Change               | File(s)                                                 |
| -------------------- | ------------------------------------------------------- |
| Layout/composition   | `src/App.tsx`                                           |
| Transcript/markdown  | `src/components/streaming-console/StreamingConsole.tsx` |
| Controls             | `src/components/ControlTray.tsx`                        |
| Settings             | `src/components/Sidebar.tsx`, `src/lib/constants.ts`    |
| Tool declarations    | `src/lib/tools/itinerary-planner.ts`                    |
| Tool implementations | `src/lib/tools/tool-registry.ts`                        |
| Map behavior         | `src/lib/map/*`, `src/components/map-3d/*`              |
| Theme tokens         | `src/index.css`                                         |
