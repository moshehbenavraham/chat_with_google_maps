# Session 04: Vitest Testing Foundation

**Session ID**: `phase00-session04-vitest-testing`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 3-4 hours

---

## Objective

Set up Vitest testing framework with React Testing Library for unit and component testing, establishing patterns for future test development.

---

## Scope

### In Scope (MVP)
- Install Vitest and React Testing Library
- Configure Vitest for the project
- Set up test utilities and helpers
- Write initial unit tests for utility functions
- Write initial component tests as examples
- Configure test coverage reporting
- Add npm scripts for testing

### Out of Scope
- E2E testing setup (future phase consideration)
- Visual regression testing
- Performance testing
- API mocking for Gemini/Maps (will be needed but deferred)

---

## Prerequisites

- [ ] Session 03 completed (Prettier configured)
- [ ] Codebase formatted and linted

---

## Deliverables

1. `vitest.config.ts` configuration
2. Test setup file with React Testing Library
3. Example utility function tests
4. Example React component tests
5. Coverage configuration
6. npm scripts: `test`, `test:watch`, `test:coverage`

---

## Technical Details

### Dependencies to Install
```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Test Structure
```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
├── lib/
│   └── utils.ts
│   └── utils.test.ts
└── test/
    ├── setup.ts
    └── test-utils.tsx
```

---

## Success Criteria

- [ ] Vitest installed and configured
- [ ] React Testing Library set up with jsdom
- [ ] Test setup file working with jest-dom matchers
- [ ] `npm run test` executes successfully
- [ ] `npm run test:watch` runs in watch mode
- [ ] `npm run test:coverage` generates coverage report
- [ ] At least 3 utility function tests written
- [ ] At least 2 React component tests written
- [ ] Coverage thresholds established (if applicable)
