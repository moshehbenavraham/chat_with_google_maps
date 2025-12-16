# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-17
**Project State**: Phase 00 - Developer Tooling & Quality Foundation
**Completed Sessions**: 1

---

## Recommended Next Session

**Session ID**: `phase00-session02-eslint-configuration`
**Session Name**: ESLint Configuration
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (TypeScript strict mode)
- [x] No TypeScript errors in codebase

### Dependencies
- **Builds on**: `phase00-session01-typescript-strict-mode` (TypeScript foundation)
- **Enables**: `phase00-session03-prettier-formatting` (requires ESLint for integration)

### Project Progression
ESLint is the natural next step in the developer tooling foundation. With TypeScript strict mode now enforced, ESLint adds code quality rules that catch bugs, enforce consistency, and establish coding standards. Session 03 (Prettier) depends on ESLint being configured first for proper ESLint-Prettier integration without rule conflicts.

---

## Session Overview

### Objective
Configure ESLint with modern flat config for React/TypeScript code quality, fix all linting issues, and establish coding standards.

### Key Deliverables
1. `eslint.config.js` with flat config format (ESLint 9.x)
2. All linting errors fixed across the codebase
3. npm scripts: `lint`, `lint:fix`
4. Documentation of rule decisions

### Scope Summary
- **In Scope (MVP)**: ESLint 9.x flat config, TypeScript-ESLint plugin, React and React Hooks plugins, import sorting rules, fix all existing errors, npm scripts
- **Out of Scope**: Custom rule development, monorepo configuration, editor-specific configurations

---

## Technical Considerations

### Technologies/Patterns
- ESLint 9.x with flat config format
- TypeScript-ESLint (`typescript-eslint`) for type-aware linting
- `eslint-plugin-react` and `eslint-plugin-react-hooks` for React patterns
- `@eslint/js` for base JavaScript rules

### Dependencies to Install
```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks
```

### Potential Challenges
- Migrating from legacy `.eslintrc` format to flat config (if any legacy config exists)
- Resolving type-aware linting issues that TypeScript compiler doesn't catch
- Balancing strictness vs. developer experience in rule selection

---

## Alternative Sessions

If this session is blocked:
1. **phase00-session04-vitest-testing** - Could be done in parallel if ESLint is waiting on external dependency resolution
2. **phase01-session01-hono-setup** - Skip ahead to backend if tooling is deprioritized (not recommended)

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
