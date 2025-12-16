# Session 02: ESLint Configuration

**Session ID**: `phase00-session02-eslint-configuration`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Configure ESLint with modern flat config for React/TypeScript code quality, fix all linting issues, and establish coding standards.

---

## Scope

### In Scope (MVP)
- Install ESLint 9.x with flat config
- Configure TypeScript-ESLint plugin
- Configure React and React Hooks plugins
- Set up import sorting rules
- Fix all existing linting errors
- Add npm scripts for linting

### Out of Scope
- Custom rule development
- Monorepo ESLint configuration
- Editor-specific configurations (handled by .vscode settings)

---

## Prerequisites

- [ ] Session 01 completed (TypeScript strict mode)
- [ ] No TypeScript errors in codebase

---

## Deliverables

1. `eslint.config.js` with flat config format
2. All linting errors fixed
3. npm scripts: `lint`, `lint:fix`
4. Documentation of rule decisions

---

## Technical Details

### Dependencies to Install
```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks
```

### Configuration Structure
```javascript
// eslint.config.js
import js from '@eslint/js';
import typescript from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  ...typescript.configs.strictTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### Rule Philosophy
- **Errors**: Issues that will cause bugs or break the app
- **Warnings**: Style issues that should be fixed but don't block
- **Off**: Rules that conflict with project patterns or Prettier

---

## Success Criteria

- [ ] ESLint 9.x with flat config installed
- [ ] TypeScript-ESLint strict type-checked rules enabled
- [ ] React and React Hooks plugins configured
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run lint` has zero warnings (or documented exceptions)
- [ ] Import sorting consistent across codebase
