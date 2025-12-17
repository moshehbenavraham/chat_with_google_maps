# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-17
**Project State**: Phase 00 - Developer Tooling & Quality Foundation
**Completed Sessions**: 2 of 5

---

## Recommended Next Session

**Session ID**: `phase00-session03-prettier-formatting`
**Session Name**: Prettier Formatting
**Estimated Duration**: 1-2 hours
**Estimated Tasks**: ~15

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 02 completed (ESLint configured)
- [x] No ESLint errors in codebase

### Dependencies
- **Builds on**: Session 02 (ESLint Configuration) - integrates with existing ESLint setup via `eslint-config-prettier`
- **Enables**: Session 04 (Vitest Testing) and Session 05 (Pre-commit Hooks)

### Project Progression
This is the natural sequential progression in Phase 00. The developer tooling chain follows a logical order:

1. TypeScript Strict Mode (foundations) ✅
2. ESLint (code quality rules) ✅
3. **Prettier (formatting)** ← YOU ARE HERE
4. Vitest (testing)
5. Pre-commit Hooks (automation)

Prettier must be configured before Vitest because the test setup needs consistent formatting, and pre-commit hooks will run both linting and formatting on staged files.

---

## Session Overview

### Objective
Set up Prettier for consistent code formatting across the entire codebase and integrate with ESLint.

### Key Deliverables
1. `.prettierrc` configuration file with project-appropriate settings
2. `.prettierignore` file excluding build artifacts
3. ESLint-Prettier integration (no conflicts between tools)
4. npm scripts: `format`, `format:check`
5. All source files formatted consistently

### Scope Summary
- **In Scope (MVP)**: Install Prettier 3.x, create configuration, integrate with ESLint, format codebase, add npm scripts
- **Out of Scope**: Editor-specific format-on-save (documented only), custom Prettier plugins, markdown/JSON formatting rules customization

---

## Technical Considerations

### Technologies/Patterns
- Prettier 3.x (code formatter)
- `eslint-config-prettier` (disables conflicting ESLint rules)
- Flat config integration with existing `eslint.config.js`

### Potential Challenges
- Ensuring no conflicts between ESLint and Prettier rules
- Large initial formatting commit if many files are affected
- Consistent settings that work for the team's preferences

### Dependencies to Install
```bash
npm install -D prettier eslint-config-prettier
```

---

## Alternative Sessions

If this session is blocked:
1. **Session 04 (Vitest Testing)** - Not recommended; requires Prettier to be set up first for consistent test file formatting
2. **Session 05 (Pre-commit Hooks)** - Not recommended; requires all quality tools (including Prettier) to be configured

**Note**: No valid alternative exists within Phase 00. Session 03 must be completed to unblock subsequent sessions.

---

## Next Steps

Run `/sessionspec` to generate the formal specification for `phase00-session03-prettier-formatting`.
