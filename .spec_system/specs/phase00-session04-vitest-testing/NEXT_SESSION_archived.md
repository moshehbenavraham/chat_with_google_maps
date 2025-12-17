# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-17
**Project State**: Phase 00 - Developer Tooling & Quality Foundation
**Completed Sessions**: 3 of 5

---

## Recommended Next Session

**Session ID**: `phase00-session04-vitest-testing`
**Session Name**: Vitest Testing Foundation
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01: TypeScript Strict Mode - Completed
- [x] Session 02: ESLint Configuration - Completed
- [x] Session 03: Prettier Formatting - Completed
- [x] Codebase formatted and linted

### Dependencies
- **Builds on**: Prettier Formatting (Session 03) - formatting rules enable consistent test file structure
- **Enables**: Pre-commit Hooks (Session 05) - hooks will run tests on staged files

### Project Progression
Testing is the fourth pillar of the developer tooling foundation. With TypeScript providing type safety, ESLint enforcing code quality, and Prettier ensuring consistent formatting, the next logical step is establishing a testing framework. Vitest integrates natively with Vite (already in use) for fast test execution and leverages the existing TypeScript configuration. This creates a complete quality gates pipeline before Session 05 adds automated enforcement via pre-commit hooks.

---

## Session Overview

### Objective
Set up Vitest testing framework with React Testing Library for unit and component testing, establishing patterns for future test development.

### Key Deliverables
1. `vitest.config.ts` - Vitest configuration with jsdom environment
2. `src/test/setup.ts` - Test setup with React Testing Library and jest-dom matchers
3. Example utility function tests (at least 3)
4. Example React component tests (at least 2)
5. npm scripts: `test`, `test:watch`, `test:coverage`
6. Coverage configuration and reporting

### Scope Summary
- **In Scope (MVP)**: Vitest + React Testing Library setup, test utilities, example tests, coverage reporting, npm scripts
- **Out of Scope**: E2E testing, visual regression testing, performance testing, API mocking for Gemini/Maps

---

## Technical Considerations

### Technologies/Patterns
- **Vitest** - Vite-native test runner, fast and TypeScript-first
- **React Testing Library** - Component testing with user-centric approach
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **jsdom** - Browser environment simulation for component tests
- **@vitest/coverage-v8** - Native V8 coverage reporting

### Potential Challenges
- **Environment Setup**: jsdom configuration must match the React 19 environment
- **Type Definitions**: May need to extend global types for Vitest globals and jest-dom matchers
- **Mock Strategies**: Utility functions that depend on browser APIs may require mocking
- **Test File Organization**: Establishing patterns (co-located vs separate test directory)

### Dependencies to Install
```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

---

## Alternative Sessions

If this session is blocked:

1. **Session 05: Pre-commit Hooks** - Not recommended. Depends on Session 04 for complete quality gate integration.
2. **Phase 01 Sessions** - Not recommended. Phase 00 should be completed before moving to backend work.

---

## Next Steps

Run `/sessionspec` to generate the formal specification for Session 04.
