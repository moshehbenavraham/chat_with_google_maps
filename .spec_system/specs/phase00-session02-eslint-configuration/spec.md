# Session Specification

**Session ID**: `phase00-session02-eslint-configuration`
**Phase**: 00 - Developer Tooling & Quality Foundation
**Status**: Not Started
**Created**: 2025-12-17

---

## 1. Session Overview

This session establishes ESLint as the primary code quality tool for the Chat with Google Maps project. ESLint will catch bugs, enforce coding standards, and ensure consistency across the 34+ TypeScript/React source files in the codebase.

With TypeScript strict mode already enabled from Session 01, ESLint adds an additional layer of quality assurance that catches issues the TypeScript compiler cannot detect - including React-specific patterns, hook usage rules, and import organization. This is essential infrastructure that all subsequent development will rely on.

This session uses ESLint 9.x with the modern flat config format, which is the current standard and provides better type safety and simpler configuration than the legacy `.eslintrc` format. The configuration will integrate TypeScript-ESLint for type-aware linting rules that leverage the existing TypeScript setup.

---

## 2. Objectives

1. Install and configure ESLint 9.x with flat config format for React/TypeScript projects
2. Enable strict type-checked rules via TypeScript-ESLint integration
3. Configure React and React Hooks plugins with appropriate rules
4. Fix all existing linting errors in the codebase to establish a clean baseline

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-typescript-strict-mode` - Provides TypeScript configuration that ESLint will integrate with for type-aware linting

### Required Tools/Knowledge
- Node.js and npm (already installed)
- Understanding of ESLint 9.x flat config format
- TypeScript configuration (`tsconfig.json`) in place

### Environment Requirements
- Project must have zero TypeScript errors before starting
- `package.json` with `"type": "module"` for ESM imports in config

---

## 4. Scope

### In Scope (MVP)
- Install ESLint 9.x and all required plugins
- Create `eslint.config.js` with flat config format
- Configure TypeScript-ESLint with strict type-checked rules
- Configure React and React Hooks plugins
- Set up import sorting rules
- Fix all existing linting errors across 34 source files
- Add npm scripts: `lint`, `lint:fix`

### Out of Scope (Deferred)
- Custom rule development - *Reason: Not needed for MVP, can add later if specific patterns emerge*
- Monorepo ESLint configuration - *Reason: Single package project*
- Editor-specific configurations - *Reason: Handled separately in .vscode settings*
- Shared config package - *Reason: Not needed for single project*

---

## 5. Technical Approach

### Architecture
ESLint will be configured using the flat config format introduced in ESLint 9.x. The configuration layers multiple presets:

```
Base JavaScript Rules (@eslint/js recommended)
    |
    v
TypeScript-ESLint (strictTypeChecked)
    |
    v
React Plugin Rules
    |
    v
React Hooks Plugin Rules
    |
    v
Project-Specific Overrides
```

### Design Patterns
- **Layered Configuration**: Start with recommended presets, then apply stricter rules
- **Type-Aware Linting**: Leverage TypeScript compiler information for deeper analysis
- **Error-First Philosophy**: Rules that prevent bugs are errors; style preferences are warnings

### Technology Stack
- ESLint 9.x (latest stable)
- typescript-eslint 8.x (unified package for TypeScript support)
- eslint-plugin-react 7.x
- eslint-plugin-react-hooks 5.x
- @eslint/js (base JavaScript rules)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `eslint.config.js` | Main ESLint flat config | ~60 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `package.json` | Add ESLint devDependencies and scripts | ~10 |
| `src/**/*.{ts,tsx}` | Fix linting errors (est. 34 files) | Variable |

---

## 7. Success Criteria

### Functional Requirements
- [ ] ESLint 9.x with flat config installed and operational
- [ ] `npx eslint --version` returns 9.x
- [ ] TypeScript-ESLint strict type-checked rules enabled
- [ ] React and React Hooks plugins configured and functional
- [ ] `npm run lint` executes without errors
- [ ] `npm run lint:fix` auto-fixes applicable issues

### Testing Requirements
- [ ] Run `npm run lint` on entire codebase - must pass with zero errors
- [ ] Verify zero warnings (or document justified exceptions)
- [ ] Test that invalid code triggers expected errors

### Quality Gates
- [ ] All source files pass linting
- [ ] No disabled rules without documented justification
- [ ] Import ordering consistent across codebase
- [ ] Configuration uses modern flat config format (not legacy .eslintrc)

---

## 8. Implementation Notes

### Key Considerations
- ESLint 9.x flat config uses ESM imports by default (project already has `"type": "module"`)
- TypeScript-ESLint `strictTypeChecked` requires `parserOptions.project` pointing to `tsconfig.json`
- React 19 and React Hooks 5.x have updated peer dependencies - verify compatibility
- Some rules may conflict with existing code patterns - document any necessary exceptions

### Potential Challenges
- **Large number of initial errors**: May find many issues on first run. Prioritize fixing in batches by category (unused vars, hook deps, etc.)
- **Type-aware rules performance**: Type-checked rules are slower. May need to optimize for large files
- **React Hooks exhaustive-deps**: May produce many warnings for intentionally excluded dependencies. Document reasoning for any suppressions

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid smart quotes, em dashes, or other Unicode in comments or config files.

---

## 9. Testing Strategy

### Unit Tests
- Not applicable (configuration-only session)

### Integration Tests
- Run `npm run lint` on entire codebase
- Verify TypeScript integration by testing type-aware rules

### Manual Testing
- Intentionally introduce common errors and verify ESLint catches them:
  - Unused variable
  - Missing React Hook dependency
  - Invalid hook call (conditional)
  - Duplicate imports
- Verify `npm run lint:fix` auto-fixes what it can

### Edge Cases
- Files with `// @ts-expect-error` should still be linted
- Test files (future) may need different rules
- Config files (`vite.config.ts`) may need rule adjustments

---

## 10. Dependencies

### External Libraries
| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^9.x | Core linting engine |
| `@eslint/js` | ^9.x | Base JavaScript rules |
| `typescript-eslint` | ^8.x | TypeScript parser and rules |
| `eslint-plugin-react` | ^7.x | React-specific rules |
| `eslint-plugin-react-hooks` | ^5.x | React Hooks rules |

### Other Sessions
- **Depends on**: `phase00-session01-typescript-strict-mode` (TypeScript configuration)
- **Depended by**: `phase00-session03-prettier-formatting` (will add eslint-config-prettier to avoid conflicts)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
