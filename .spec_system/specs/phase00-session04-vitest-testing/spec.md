# Session Specification

**Session ID**: `phase00-session04-vitest-testing`
**Phase**: 00 - Developer Tooling & Quality Foundation
**Status**: Not Started
**Created**: 2025-12-17

---

## 1. Session Overview

This session establishes Vitest as the testing framework for the Chat with Google Maps project, integrating React Testing Library for component testing and setting up comprehensive test infrastructure. Vitest is the natural choice for this Vite-based project due to its native integration, fast execution, and first-class TypeScript support.

Testing is the fourth pillar of the developer tooling foundation. With TypeScript strict mode providing type safety, ESLint enforcing code quality, and Prettier ensuring consistent formatting, this session completes the quality gates infrastructure. The test framework will enable developers to write unit tests for utility functions and component tests for React components, establishing patterns that will be used throughout the project lifecycle.

This session creates the foundation for test-driven development practices and prepares the codebase for Session 05, which will add pre-commit hooks that automatically run tests on staged files before commits are allowed.

---

## 2. Objectives

1. Install and configure Vitest with jsdom environment for browser simulation
2. Set up React Testing Library with jest-dom matchers for component testing
3. Create reusable test utilities and establish test file organization patterns
4. Write example tests demonstrating unit and component testing patterns

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-typescript-strict-mode` - TypeScript strict mode enabled
- [x] `phase00-session02-eslint-configuration` - ESLint configured for code quality
- [x] `phase00-session03-prettier-formatting` - Prettier configured for consistent formatting

### Required Tools/Knowledge
- Node.js v18+ with npm
- Understanding of Vitest and React Testing Library APIs
- Familiarity with jsdom testing environment

### Environment Requirements
- Existing Vite + React 19 project configuration
- TypeScript strict mode enabled (for type-safe tests)
- ESLint and Prettier configured (tests will follow same rules)

---

## 4. Scope

### In Scope (MVP)
- Install Vitest, React Testing Library, and supporting dependencies
- Create `vitest.config.ts` with jsdom environment and coverage settings
- Create test setup file with jest-dom matchers
- Create test utilities for rendering components with providers
- Write unit tests for `src/types/guards.ts` utility functions
- Write unit test for `src/lib/utils.ts` base64 conversion function
- Write component test demonstrating React Testing Library patterns
- Configure npm scripts: `test`, `test:watch`, `test:coverage`
- Set up V8 coverage reporting with HTML output

### Out of Scope (Deferred)
- E2E testing (Playwright/Cypress) - *Reason: Phase 02 consideration*
- Visual regression testing - *Reason: Not needed for MVP*
- Performance testing - *Reason: Not needed for MVP*
- API mocking for Gemini/Maps services - *Reason: Needed when testing API integration*
- Coverage thresholds enforcement - *Reason: Can be added incrementally*

---

## 5. Technical Approach

### Architecture
Vitest will be configured as a standalone config file that extends the existing Vite configuration. Tests will be co-located with their source files (e.g., `utils.test.ts` alongside `utils.ts`) following modern testing conventions. A central test setup file will configure global matchers and any necessary polyfills.

### Design Patterns
- **Co-located Tests**: Test files live alongside source files for easy navigation
- **Test Utilities**: Centralized utilities for common test setup (render with providers)
- **AAA Pattern**: Arrange-Act-Assert structure for all tests
- **User-centric Testing**: React Testing Library's philosophy of testing user behavior, not implementation

### Technology Stack
- Vitest 3.x - Vite-native test runner
- @testing-library/react 16.x - Component testing utilities
- @testing-library/jest-dom 6.x - Custom DOM matchers
- @testing-library/user-event 14.x - User interaction simulation
- jsdom 26.x - Browser environment simulation
- @vitest/coverage-v8 3.x - Native V8 coverage reporting

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `vitest.config.ts` | Vitest configuration with jsdom and coverage | ~25 |
| `src/test/setup.ts` | Test setup with jest-dom matchers | ~15 |
| `src/test/test-utils.tsx` | Render utilities with provider wrappers | ~30 |
| `src/types/guards.test.ts` | Unit tests for type guard functions | ~80 |
| `src/lib/utils.test.ts` | Unit tests for utility functions | ~30 |
| `src/components/ErrorScreen.test.tsx` | Component test example | ~50 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `package.json` | Add test scripts and dev dependencies | ~15 |
| `tsconfig.json` | Add vitest and testing-library types | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `npm run test` executes all tests successfully
- [ ] `npm run test:watch` runs tests in watch mode
- [ ] `npm run test:coverage` generates HTML coverage report
- [ ] All type guard functions have passing unit tests
- [ ] Base64 utility function has passing unit test
- [ ] At least one component test demonstrates RTL patterns

### Testing Requirements
- [ ] Minimum 3 utility function tests passing
- [ ] Minimum 1 component test passing
- [ ] Jest-dom matchers available globally
- [ ] Test utilities properly export render helpers

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings throughout
- [ ] ESLint passes on all test files
- [ ] Prettier formatting applied to all test files
- [ ] TypeScript compiles all test files without errors

---

## 8. Implementation Notes

### Key Considerations
- Vitest globals must be enabled for jest-like `describe`, `it`, `expect` syntax
- TypeScript types for Vitest globals and jest-dom must be properly configured
- Test setup file must be imported before any tests run
- jsdom environment must be configured for React 19 compatibility

### Potential Challenges
- **Type Definitions**: May need `/// <reference types="vitest/globals" />` and custom type augmentation for jest-dom matchers
- **Provider Mocking**: Components using `useLiveAPIContext` will need mock providers in test utilities
- **Browser APIs**: Functions using `window`, `AudioContext`, etc. may need mocking or conditional skipping
- **Path Aliases**: Vitest must be configured to resolve `@/*` paths matching tsconfig

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid curly quotes, em dashes, and other Unicode characters.

---

## 9. Testing Strategy

### Unit Tests
- `isObject()` - Test with objects, primitives, null, undefined
- `hasProperty()` - Test property existence and absence
- `isLatLngLiteral()` - Test valid/invalid coordinate objects
- `isNonEmptyString()` - Test empty, non-empty, non-string values
- `isNonEmptyArray()` - Test empty, non-empty arrays
- `assertDefined()` - Test throwing behavior
- `getOrDefault()` - Test null/undefined coalescing
- `base64ToArrayBuffer()` - Test valid base64 conversion

### Integration Tests
- Not applicable for this session (unit tests only)

### Manual Testing
- Run `npm run test` and verify all tests pass
- Run `npm run test:watch` and verify file watching works
- Run `npm run test:coverage` and open HTML report in browser
- Verify coverage report shows tested files with line coverage

### Edge Cases
- Type guards with `null` vs `undefined`
- Empty strings vs whitespace-only strings
- Arrays with falsy values
- Objects with inherited properties

---

## 10. Dependencies

### External Libraries
- vitest: ^3.0.0
- @vitest/coverage-v8: ^3.0.0
- @testing-library/react: ^16.0.0
- @testing-library/jest-dom: ^6.0.0
- @testing-library/user-event: ^14.0.0
- jsdom: ^26.0.0

### Other Sessions
- **Depends on**: phase00-session03-prettier-formatting (completed)
- **Depended by**: phase00-session05-precommit-hooks (hooks will run tests)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
