# Session Specification

**Session ID**: `phase00-session01-typescript-strict-mode`
**Phase**: 00 - Developer Tooling & Quality Foundation
**Status**: Not Started
**Created**: 2025-12-16

---

## 1. Session Overview

This session establishes a type-safe foundation for the Chat with Google Maps project by enabling TypeScript strict mode and resolving all resulting type errors. The codebase currently has 35 TypeScript/TSX files with 16 pre-existing type errors in the Google Maps type declarations that must be fixed before enabling strict mode.

TypeScript strict mode is the critical first step in Phase 00 because it provides the foundation upon which all other developer tooling depends. ESLint type-aware rules require a clean TypeScript compilation. Proper type safety catches bugs at compile time, enables confident refactoring, and provides better IDE support throughout development.

The session will systematically enable strict compiler flags, fix all type errors, and establish type patterns that will guide future development. This includes proper handling of React component props, hook return types, null/undefined values, and third-party library integrations (Google Maps SDK, Gemini API, Zustand).

---

## 2. Objectives

1. Enable TypeScript strict mode with all recommended strict flags in `tsconfig.json`
2. Resolve all 16 existing type errors in `map-3d-types.ts` (duplicate type declarations)
3. Fix all new type errors introduced by strict mode across the 35 source files
4. Establish consistent type patterns for React components, hooks, and utility functions

---

## 3. Prerequisites

### Required Sessions
- [x] Initial project setup - React + Vite + TypeScript initialized

### Required Tools/Knowledge
- TypeScript 5.8+ (already installed: ~5.8.2)
- Understanding of TypeScript strict mode flags
- Knowledge of React component typing patterns
- Familiarity with Google Maps and Gemini API types

### Environment Requirements
- Node.js installed with npm
- Project dependencies installed (`npm install`)
- Working development environment

---

## 4. Scope

### In Scope (MVP)
- Enable `strict: true` and additional strict flags in tsconfig.json
- Fix 16 existing duplicate type declaration errors in `map-3d-types.ts`
- Add missing `@types/*` packages for libraries (lodash, react)
- Fix all strict mode type errors across all 35 source files
- Add explicit type annotations where inference is insufficient
- Establish type guard patterns for union type narrowing
- Add proper null/undefined handling with optional chaining
- Create shared type utilities file if common patterns emerge

### Out of Scope (Deferred)
- Adding JSDoc comments to all functions - *Reason: Session 02 ESLint concern*
- Monorepo tsconfig configuration - *Reason: Not needed for current project structure*
- Declaration file generation (.d.ts) - *Reason: Not a library, no consumers*
- Runtime type validation with Zod - *Reason: Future enhancement, not MVP*

---

## 5. Technical Approach

### Architecture
The approach is systematic and incremental:
1. First fix existing errors to establish a clean baseline
2. Enable strict flags one by one to isolate error sources
3. Fix errors file-by-file, starting with leaf modules (no dependencies)
4. Work up to complex components that depend on fixed modules

### Design Patterns
- **Type Guards**: For narrowing union types safely (e.g., `isValidPlace()`)
- **Discriminated Unions**: For state management patterns
- **Generic Constraints**: For reusable hook and component patterns
- **Optional Chaining**: For safe property access (`obj?.prop`)
- **Nullish Coalescing**: For default values (`value ?? default`)

### Technology Stack
- TypeScript ~5.8.2
- React 19.2.0 with react-jsx transform
- @types/react (to be added if missing)
- @types/lodash (to be added)
- @vis.gl/react-google-maps 1.5.5 (includes types)
- @google/genai ^1.4.0 (includes types)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/types/guards.ts` | Type guard utility functions | ~50 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|------------|
| `tsconfig.json` | Enable strict mode flags | ~15 |
| `src/components/map-3d/map-3d-types.ts` | Fix 16 duplicate declaration errors | ~80 |
| `src/components/*.tsx` (6 files) | Add prop types, fix null checks | ~30 each |
| `src/contexts/LiveAPIContext.tsx` | Type context value properly | ~20 |
| `src/hooks/use-live-api.ts` | Add return type annotations | ~15 |
| `src/lib/**/*.ts` (12 files) | Fix implicit any, null checks | ~20 each |
| `src/stores/index.ts` | Type Zustand store properly | ~25 |
| `package.json` | Add @types/* devDependencies | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `strict: true` enabled in tsconfig.json
- [ ] `noUncheckedIndexedAccess: true` enabled
- [ ] `noImplicitReturns: true` enabled
- [ ] `noFallthroughCasesInSwitch: true` enabled
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds

### Testing Requirements
- [ ] Application starts without runtime errors (`npm run dev`)
- [ ] All existing functionality works (manual smoke test)
- [ ] No regression in Google Maps rendering
- [ ] No regression in voice/audio functionality

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings throughout
- [ ] No `any` types except where explicitly documented with `// eslint-disable-next-line` comment
- [ ] All React component props have explicit interface/type definitions
- [ ] All exported functions have explicit return types

---

## 8. Implementation Notes

### Key Considerations
- The `map-3d-types.ts` file has conflicting type declarations with Google Maps library types - need to use declaration merging or remove duplicates
- React 19 may have slightly different type requirements than React 18
- Zustand store typing requires careful handling of state selectors
- Audio worklet types may need special handling (Web Audio API)

### Potential Challenges
- **Google Maps type conflicts**: The custom type declarations in `map-3d-types.ts` conflict with `@vis.gl/react-google-maps` types. Mitigation: Remove duplicate declarations and use library types directly or use proper module augmentation.
- **Gemini SDK types**: May have implicit any in callback parameters. Mitigation: Add explicit type annotations at call sites.
- **Event handler typing**: DOM and React events need explicit types. Mitigation: Use React.MouseEvent, React.ChangeEvent etc.
- **Audio worklet typing**: Web Audio API has complex types. Mitigation: Use established patterns from @types/audioworklet.

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em dashes, or special Unicode characters in code or comments.

---

## 9. Testing Strategy

### Unit Tests
- Not applicable for this session (pure configuration + type fixes)
- Types are verified by compiler, not runtime tests

### Integration Tests
- Not applicable (no new functionality)

### Manual Testing
- Start dev server and verify app loads: `npm run dev`
- Test Google Maps 3D rendering and camera controls
- Test voice input/output functionality
- Test sidebar interactions
- Verify no console errors

### Edge Cases
- Null/undefined returns from API calls
- Empty arrays from search results
- Missing optional properties in API responses
- Disconnected audio/video states

---

## 10. Dependencies

### External Libraries
- typescript: ~5.8.2 (devDependency)
- @types/react: ^19.0.0 (to add)
- @types/react-dom: ^19.0.0 (to add)
- @types/lodash: ^4.17.0 (to add)

### Other Sessions
- **Depends on**: None (first session)
- **Depended by**: Session 02 (ESLint), Session 03 (Prettier), Session 05 (Pre-commit Hooks)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
