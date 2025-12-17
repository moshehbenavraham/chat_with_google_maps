# Session Specification

**Session ID**: `phase01-session01-hono-setup`
**Phase**: 01 - Backend API Layer (Hono)
**Status**: Not Started
**Created**: 2025-12-17

---

## 1. Session Overview

This session establishes the foundational backend infrastructure for the Chat with Google Maps application by installing and configuring Hono as the API framework. Hono is a lightweight (~14KB), ultrafast web framework that uses web-standard Request/Response objects, making it portable across Vercel, Cloudflare Workers, AWS Lambda, Deno Deploy, Bun, and Node.js.

The primary deliverable is a working `/api` directory structure with a health check endpoint accessible through Vite's development proxy. This creates the foundation for all subsequent backend work including API key protection (Session 02), database access (Phase 02), and authentication (Phase 03). By establishing this infrastructure now, we validate the architecture before adding complexity.

This session transforms the project from a client-only React application into a full-stack application with a clear separation between frontend (React + Vite) and backend (Hono API). The Vite proxy configuration ensures seamless local development where frontend code can call `/api/*` endpoints without CORS issues or complex development server setup.

---

## 2. Objectives

1. Install and configure Hono 4.x as the backend API framework with proper TypeScript support
2. Create a modular `/api` directory structure following best practices for route organization
3. Configure Vite development server to proxy `/api/*` requests to a local Hono dev server
4. Implement a health check endpoint (`GET /api/health`) returning status, timestamp, and version
5. Establish development workflow for running frontend and backend concurrently

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-typescript-strict-mode` - TypeScript strict mode enabled
- [x] `phase00-session02-eslint-configuration` - ESLint configured with zero warnings
- [x] `phase00-session03-prettier-formatting` - Prettier formatting applied
- [x] `phase00-session04-vitest-testing` - Vitest testing framework operational
- [x] `phase00-session05-precommit-hooks` - Pre-commit hooks blocking quality issues

### Required Tools/Knowledge
- Node.js 18+ and npm
- Understanding of Hono framework basics
- Familiarity with Vite proxy configuration

### Environment Requirements
- Vite development server working (`npm run dev`)
- All Phase 00 quality gates passing (`npm run quality`)

---

## 4. Scope

### In Scope (MVP)
- Install `hono` and `@hono/node-server` packages
- Create `/api` directory structure (`/api/index.ts`, `/api/routes/`, `/api/lib/`)
- Create main Hono application entry point with proper exports
- Create health check route returning JSON response
- Configure Vite dev server proxy for `/api/*` requests
- Add TypeScript configuration for API directory (extend tsconfig)
- Add npm scripts for API development (`api:dev`, `dev:all`)
- Create type definitions for API responses
- Write unit tests for health endpoint
- Verify local development workflow with proxy

### Out of Scope (Deferred)
- API key protection - *Reason: Session 02 deliverable*
- Gemini API proxy routes - *Reason: Session 02 deliverable*
- Maps API proxy routes - *Reason: Session 02 deliverable*
- Vercel deployment configuration - *Reason: Session 03 deliverable*
- CORS middleware - *Reason: Not needed for proxy-based development; add in Session 02*
- Database connections - *Reason: Phase 02 scope*
- Authentication - *Reason: Phase 03 scope*

---

## 5. Technical Approach

### Architecture

```
Development Mode:
+-------------+     +-----------------+     +------------------+
|   Browser   | --> | Vite Dev Server | --> | Hono Dev Server  |
|  (port 3003)|     |   (port 3003)   |     |   (port 3001)    |
+-------------+     +-----------------+     +------------------+
       |                    |                       |
       |   /api/* --------> | ---proxy-----------> |
       |   other ---------> | (serve static)       |
```

```
Directory Structure:
api/
+-- index.ts           # Main Hono app, exports default handler
+-- routes/
|   +-- health.ts      # Health check endpoint
+-- lib/
    +-- types.ts       # Shared API types
```

### Design Patterns
- **Route Modularization**: Each route in its own file under `/api/routes/` for maintainability
- **Type-First Development**: Define response types before implementing routes
- **Separation of Concerns**: API code isolated from frontend code

### Technology Stack
- Hono 4.x - Ultrafast, lightweight web framework
- @hono/node-server - Node.js adapter for local development
- tsx - TypeScript execution for development
- Vite 6.x - Frontend build tool with proxy configuration
- TypeScript 5.8 - Type-safe development

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/index.ts` | Main Hono application entry point | ~25 |
| `api/routes/health.ts` | Health check endpoint implementation | ~20 |
| `api/lib/types.ts` | Shared API type definitions | ~15 |
| `api/tsconfig.json` | TypeScript config for API (extends root) | ~15 |
| `api/__tests__/health.test.ts` | Unit tests for health endpoint | ~40 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `package.json` | Add hono deps, tsx, api scripts | ~15 |
| `vite.config.ts` | Add proxy configuration for /api/* | ~10 |
| `tsconfig.json` | Add api directory to include | ~2 |
| `.env.example` | Add API_PORT variable | ~2 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `hono` and `@hono/node-server` packages installed in dependencies
- [ ] `/api/index.ts` exports valid Hono application
- [ ] `GET /api/health` returns JSON: `{ status: "ok", timestamp: string, version: string }`
- [ ] Vite proxy correctly forwards `/api/*` requests to Hono server
- [ ] `npm run api:dev` starts Hono server on port 3001
- [ ] `npm run dev:all` starts both Vite and Hono concurrently
- [ ] Frontend can call `/api/health` and receive response

### Testing Requirements
- [ ] Unit tests for health endpoint written and passing
- [ ] Manual testing: verify proxy works in browser dev tools
- [ ] Manual testing: verify response format is correct JSON

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes without warnings (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format:check`)
- [ ] All tests pass (`npm run test`)
- [ ] Pre-commit hooks pass

---

## 8. Implementation Notes

### Key Considerations
- Use `@hono/node-server` for local development; production will use Vercel's native Hono support
- The health endpoint version should read from `package.json` version field
- Proxy configuration must handle both GET and POST methods
- TypeScript config for API must align with root strict settings

### Potential Challenges
- **Vite proxy not forwarding**: Ensure proxy target matches Hono server port; test with curl first
- **TypeScript path resolution**: API may need its own tsconfig extending root; verify import paths work
- **Port conflicts**: Make API port configurable via environment variable (default 3001)
- **Hot reload**: tsx provides hot reload for API; verify it works before considering alternatives

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid smart quotes, em dashes, and special Unicode characters.

---

## 9. Testing Strategy

### Unit Tests
- Test health endpoint returns correct status code (200)
- Test health endpoint returns correct Content-Type (application/json)
- Test response body has required fields (status, timestamp, version)
- Test timestamp is valid ISO 8601 format
- Test version matches package.json version

### Integration Tests
- None for this session (deferred to deployment verification)

### Manual Testing
1. Start API server: `npm run api:dev`
2. Verify health endpoint directly: `curl http://localhost:3001/api/health`
3. Start full dev environment: `npm run dev:all`
4. Verify proxy works: Open browser dev tools, check Network tab for `/api/health`
5. Verify response format in browser console

### Edge Cases
- Server not started: Frontend should handle connection refused gracefully
- Invalid route: Should return 404 (Hono default behavior)

---

## 10. Dependencies

### External Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| hono | ^4.6.x | Web framework |
| @hono/node-server | ^1.13.x | Node.js adapter for local dev |
| tsx | ^4.19.x | TypeScript execution (devDep) |
| concurrently | ^9.1.x | Run multiple npm scripts (devDep) |

### Other Sessions
- **Depends on**: Phase 00 sessions (quality foundation)
- **Depended by**: `phase01-session02-api-key-protection`, `phase01-session03-deployment-verification`

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
