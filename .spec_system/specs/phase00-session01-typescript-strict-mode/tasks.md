# Task Checklist

**Session ID**: `phase00-session01-typescript-strict-mode`
**Total Tasks**: 35
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-16
**Completed**: 2025-12-17

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0001]` = Session reference (Phase 00, Session 01)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 11 | 11 | 0 |
| Testing | 4 | 4 | 0 |
| Validation Fixes | 11 | 11 | 0 |
| **Total** | **35** | **35** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0001] Verify project dependencies and dev server works (`npm install && npm run dev`)
- [x] T002 [S0001] Add missing @types packages to devDependencies (`package.json`)
- [x] T003 [S0001] Create type guards utility file (`src/types/guards.ts`)

---

## Foundation (6 tasks)

Core type fixes and tsconfig configuration.

- [x] T004 [S0001] Fix 16 duplicate declaration errors in map-3d-types.ts (`src/components/map-3d/map-3d-types.ts`)
- [x] T005 [S0001] Verify zero errors with `npx tsc --noEmit` after map-3d-types fix
- [x] T006 [S0001] Enable `strict: true` in tsconfig.json (`tsconfig.json`)
- [x] T007 [S0001] Enable `noUncheckedIndexedAccess: true` in tsconfig.json (`tsconfig.json`)
- [x] T008 [S0001] Enable `noImplicitReturns: true` in tsconfig.json (`tsconfig.json`)
- [x] T009 [S0001] Enable `noFallthroughCasesInSwitch: true` in tsconfig.json (`tsconfig.json`)

---

## Implementation (11 tasks)

Fix strict mode type errors across all source files.

- [x] T010 [S0001] [P] Fix type errors in constants and utility files (`src/lib/constants.ts`, `src/lib/utils.ts`)
- [x] T011 [S0001] [P] Fix type errors in prompts module (`src/lib/prompts/*.ts`)
- [x] T012 [S0001] [P] Fix type errors in audio worklet files (`src/lib/worklets/*.ts`)
- [x] T013 [S0001] Fix type errors in audio library files (`src/lib/audio/*.ts`)
- [x] T014 [S0001] Fix type errors in map library files (`src/lib/map/*.ts`)
- [x] T015 [S0001] Fix type errors in API client files (`src/lib/api/*.ts`)
- [x] T016 [S0001] Fix type errors in tools module (`src/lib/tools/*.ts`)
- [x] T017 [S0001] Fix type errors in Zustand store (`src/stores/index.ts`)
- [x] T018 [S0001] Fix type errors in hooks (`src/hooks/use-live-api.ts`)
- [x] T019 [S0001] Fix type errors in context provider (`src/contexts/LiveAPIContext.tsx`)
- [x] T020 [S0001] [P] Fix type errors in all React components (`src/components/**/*.tsx`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T021 [S0001] Run `npx tsc --noEmit` and verify zero errors
- [x] T022 [S0001] Run `npm run build` and verify successful build
- [x] T023 [S0001] Validate ASCII encoding on all modified files
- [x] T024 [S0001] Manual testing - verify app loads and core functionality works

---

## Validation Fixes (11 tasks)

Issues identified by `/validate` command that must be resolved.

### Undocumented `any` Types (10 tasks)

Add `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- [reason]` or replace with proper types.

- [x] T025 [S0001] [P] Fix undocumented `any` in `src/stores/index.ts:123` - `parameters?: any`
- [x] T026 [S0001] [P] Fix undocumented `any` in `src/lib/tools/tool-registry.ts:51` - `args: any`
- [x] T027 [S0001] [P] Fix undocumented `any` in `src/lib/audio/audio-streamer.ts:51` - `<T extends (d: any) => void>`
- [x] T028 [S0001] [P] Fix undocumented `any` in `src/lib/api/genai-live-client.ts:108` - `catch (e: any)`
- [x] T029 [S0001] [P] Fix undocumented `any` in `src/lib/api/maps-grounding.ts:36` - `const request: any`
- [x] T030 [S0001] [P] Fix undocumented `any` in `src/lib/api/maps-grounding.ts:91` - `const requestBody: any`
- [x] T031 [S0001] [P] Fix undocumented `any` in `src/components/streaming-console/StreamingConsole.tsx:88` - `const config: any`
- [x] T032 [S0001] [P] Fix undocumented `any` in `src/components/streaming-console/StreamingConsole.tsx:181` - `(p: any) => p.text`
- [x] T033 [S0001] [P] Fix undocumented `any` in `src/hooks/use-live-api.ts:106` - `.addWorklet<any>(..., (ev: any)`
- [x] T034 [S0001] [P] Fix undocumented `any` in `src/hooks/use-live-api.ts:194` - `functionResponses: any[]`

### Missing Return Types (1 task)

- [x] T035 [S0001] Add explicit return type to `useLiveAPIContext` in `src/contexts/LiveAPIContext.tsx:54`

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] `npx tsc --noEmit` passes with zero errors
- [x] `npm run build` succeeds
- [x] All files ASCII-encoded (0-127 characters only)
- [x] No `any` types except where explicitly documented
- [x] All React component props have explicit interface/type definitions
- [x] All exported functions have explicit return types
- [x] Application starts without runtime errors
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks marked `[P]` can be worked on simultaneously:
- T010, T011, T012 (independent lib modules)
- T020 (component fixes after lib modules are done)
- T025-T034 (all validation fixes are independent)

### Task Timing
Target ~20-25 minutes per task.
Validation fixes: ~5-10 minutes each.

### Dependencies
1. T001-T003 must complete before T004
2. T004-T005 must complete before T006-T009 (fix existing errors before enabling strict)
3. T006-T009 must complete before T010-T020 (enable strict before fixing new errors)
4. T010-T020 must complete before T021-T024 (fix all errors before testing)
5. T025-T035 must complete before re-running `/validate`

### Key Files by Error Category

**Existing Errors (16 total)**:
- `src/components/map-3d/map-3d-types.ts` - All 16 duplicate declaration errors

**Expected Strict Mode Error Locations**:
- Implicit `any` types in callback parameters
- Null/undefined handling in optional properties
- Missing return type annotations
- Uninitialized class properties
- Index access without null checks

### Type Patterns to Establish

1. **Type Guards**: Create in `src/types/guards.ts`
   - `isValidPlace(value: unknown): value is Place`
   - `isLatLngLiteral(value: unknown): value is google.maps.LatLngLiteral`

2. **React Component Props**: Use interface per component
   ```typescript
   interface SidebarProps {
     isOpen: boolean;
     onClose: () => void;
   }
   ```

3. **Hook Return Types**: Explicit tuple/object types
   ```typescript
   function useLiveApi(): UseLiveApiReturn { ... }
   ```

4. **Null Handling**: Use optional chaining and nullish coalescing
   ```typescript
   const value = data?.property ?? defaultValue;
   ```

### Validation Fix Patterns

For each undocumented `any`, choose one approach:

**Option A: Add eslint-disable comment**
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK types incomplete
const config: any = { ... };
```

**Option B: Replace with proper type**
```typescript
// Instead of: catch (e: any)
catch (e: unknown) {
  const message = e instanceof Error ? e.message : 'Unknown error';
}

// Instead of: parameters?: any
parameters?: Record<string, unknown>;

// Instead of: functionResponses: any[]
functionResponses: FunctionResponse[];
```

---

## Session Status

**Complete** - All 35 tasks completed. Ready for `/validate`.
