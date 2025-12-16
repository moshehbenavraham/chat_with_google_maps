# Task Checklist

**Session ID**: `phase00-session02-eslint-configuration`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-17

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0002]` = Session reference (Phase 00, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 9 | 9 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0002] Verify prerequisites - run `npx tsc --noEmit` to confirm zero TypeScript errors
- [x] T002 [S0002] Verify `package.json` has `"type": "module"` for ESM flat config support
- [x] T003 [S0002] Install ESLint and all required plugins (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`)

---

## Foundation (6 tasks)

Core ESLint configuration structure.

- [x] T004 [S0002] Create `eslint.config.js` with base structure and ESM imports
- [x] T005 [S0002] Configure `@eslint/js` recommended rules as base layer
- [x] T006 [S0002] Configure TypeScript-ESLint with `strictTypeChecked` preset and `parserOptions.project`
- [x] T007 [S0002] Configure `eslint-plugin-react` with recommended rules and React 19 settings
- [x] T008 [S0002] Configure `eslint-plugin-react-hooks` with recommended rules
- [x] T009 [S0002] Add `lint` and `lint:fix` npm scripts to `package.json`

---

## Implementation (9 tasks)

Fix all linting errors across the codebase.

- [x] T010 [S0002] Run initial `npm run lint` to identify all errors and categorize by type
- [x] T011 [S0002] Fix unused variable/import errors across all source files (`src/**/*.{ts,tsx}`)
- [x] T012 [S0002] Fix explicit `any` type errors - add proper type annotations (`src/**/*.{ts,tsx}`)
- [x] T013 [S0002] Fix React Hook dependency array warnings - `exhaustive-deps` rule (`src/**/*.tsx`)
- [x] T014 [S0002] Fix import ordering and organization issues (`src/**/*.{ts,tsx}`)
- [x] T015 [S0002] [P] Fix component-specific issues in `src/components/**/*.tsx`
- [x] T016 [S0002] [P] Fix hook-specific issues in `src/hooks/**/*.ts`
- [x] T017 [S0002] [P] Fix context-specific issues in `src/contexts/**/*.tsx`
- [x] T018 [S0002] Add justified inline suppressions with comments for any necessary exceptions

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0002] Run `npm run lint` - verify zero errors on entire codebase
- [x] T020 [S0002] Test `npm run lint:fix` auto-fixes applicable issues correctly
- [x] T021 [S0002] Manual testing - introduce intentional errors (unused var, missing hook dep, conditional hook) and verify detection
- [x] T022 [S0002] Validate ASCII encoding on `eslint.config.js` and all modified files

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] `npm run lint` passes with zero errors
- [x] `npm run lint:fix` works correctly
- [x] All files ASCII-encoded (no smart quotes, em dashes)
- [x] `npx eslint --version` returns 9.x
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T015, T016, and T017 are marked `[P]` as they target independent directory trees and can be worked on simultaneously.

### Task Timing
Target ~20-25 minutes per task. Implementation tasks (T011-T018) may vary based on number of errors found.

### Dependencies
- T003 must complete before T004-T009
- T009 must complete before T010
- T010 must complete before T011-T018
- T011-T018 must complete before T019-T022

### Expected Error Categories
Based on typical React/TypeScript codebases:
1. Unused imports/variables
2. Missing type annotations (explicit any)
3. React Hook dependency arrays
4. Import ordering
5. React-specific patterns (key props, etc.)

### Type-Aware Linting
The `strictTypeChecked` preset enables rules that use TypeScript's type information. These are slower but catch more bugs. The `parserOptions.project` must point to `tsconfig.json`.

---

## Configuration Reference

### eslint.config.js Structure
```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  // React and project-specific configs
);
```

### npm Scripts
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
