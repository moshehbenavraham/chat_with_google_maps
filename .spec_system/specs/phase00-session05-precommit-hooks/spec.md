# Session Specification

**Session ID**: `phase00-session05-precommit-hooks`
**Phase**: 00 - Developer Tooling & Quality Foundation
**Status**: Not Started
**Created**: 2025-12-17

---

## 1. Session Overview

This session establishes automated quality enforcement through pre-commit hooks, ensuring that all code entering the repository meets the project's quality standards. By integrating Husky and lint-staged, every commit will automatically run ESLint, Prettier, and TypeScript type checking on staged files, blocking commits that fail any quality gate.

This is the **final session** of Phase 00, completing the Developer Tooling & Quality Foundation. Once implemented, the project will have a comprehensive quality pipeline: TypeScript strict mode catches type errors, ESLint enforces code quality rules, Prettier ensures consistent formatting, Vitest provides testing capabilities, and pre-commit hooks tie it all together with automated enforcement.

Completing this session creates a robust foundation for Phase 01 (Backend API Layer with Hono), ensuring that as complexity grows, code quality remains consistently high. Contributors cannot accidentally commit code with linting errors, formatting issues, or type errors.

---

## 2. Objectives

1. Install and configure Husky for git hook management with automatic setup on `npm install`
2. Configure lint-staged to run ESLint and Prettier only on staged files for fast feedback
3. Create a pre-commit hook that enforces linting, formatting, and type checking
4. Add npm scripts for manual quality checks and hook management

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-typescript-strict-mode` - TypeScript strict mode and `tsc` available
- [x] `phase00-session02-eslint-configuration` - ESLint configured with `npm run lint`
- [x] `phase00-session03-prettier-formatting` - Prettier configured with `npm run format`
- [x] `phase00-session04-vitest-testing` - Vitest configured with `npm run test`

### Required Tools/Knowledge
- Node.js and npm (already present)
- Git repository initialized (confirmed)
- Understanding of git hooks workflow

### Environment Requirements
- Git repository with `.git` directory
- npm scripts for lint, format available
- TypeScript compiler available

---

## 4. Scope

### In Scope (MVP)
- Install Husky (v9+) for modern git hooks
- Install lint-staged for efficient staged-file processing
- Configure lint-staged for `.ts`, `.tsx`, `.json`, `.md`, `.css` files
- Create pre-commit hook running lint-staged and typecheck
- Add `npm run typecheck` script for standalone type checking
- Add `npm run quality` script for full manual quality check
- Add `npm run prepare` script for Husky auto-setup
- Update `.gitignore` if needed for Husky artifacts

### Out of Scope (Deferred)
- CI/CD pipeline configuration - *Reason: Separate concern, Phase 01+*
- Pre-push hooks for test running - *Reason: Can slow down workflow, consider later*
- Commit message linting (commitlint) - *Reason: Nice-to-have, not MVP*
- Branch protection rules - *Reason: GitHub settings, not code*
- Automated changelog/release - *Reason: Future enhancement*

---

## 5. Technical Approach

### Architecture
```
Git Commit Flow:

  git commit --> .husky/pre-commit --> lint-staged --> ESLint --fix
                        |                    |
                        |                    +--> Prettier --write
                        |
                        +--> tsc --noEmit (full project)
                        |
                        +--> SUCCESS: Commit proceeds
                        |    FAILURE: Commit blocked with error
```

### Design Patterns
- **Staged-only processing**: lint-staged runs tools only on staged files for speed
- **Fix-on-commit**: ESLint and Prettier auto-fix issues when possible
- **Fail-fast**: Type errors block commit immediately with clear output
- **Zero-config contributor setup**: `npm install` triggers `prepare` script

### Technology Stack
- **Husky**: v9.x - Modern git hooks manager (lightweight, well-maintained)
- **lint-staged**: v15.x - Run linters on staged files only

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `.husky/pre-commit` | Pre-commit hook script | ~5 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|------------|
| `package.json` | Add devDependencies, scripts, lint-staged config | ~25 |

### Configuration Summary
```json
// package.json additions
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "quality": "npm run typecheck && npm run lint && npm run format:check && npm run test",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,html}": ["prettier --write"]
  }
}
```

---

## 7. Success Criteria

### Functional Requirements
- [ ] `npm install` automatically sets up Husky hooks (via prepare script)
- [ ] Committing a file with ESLint errors is blocked
- [ ] Committing a file with Prettier formatting issues auto-fixes them
- [ ] Committing a file with TypeScript errors is blocked
- [ ] Clean commits proceed without issues
- [ ] `npm run typecheck` runs TypeScript checking standalone
- [ ] `npm run quality` runs all quality checks in sequence

### Testing Requirements
- [ ] Manual test: Create file with lint error, attempt commit, verify blocked
- [ ] Manual test: Create file with bad formatting, commit, verify auto-fixed
- [ ] Manual test: Create file with type error, attempt commit, verify blocked
- [ ] Manual test: Clean file commits successfully
- [ ] Manual test: Fresh clone + `npm install` sets up hooks correctly

### Quality Gates
- [ ] All output files use ASCII-only characters (0-127)
- [ ] Unix LF line endings in all created files
- [ ] Hook script is executable
- [ ] No lint warnings in modified files
- [ ] Pre-commit completes in <10 seconds on typical commit

---

## 8. Implementation Notes

### Key Considerations
- **Husky v9 changes**: Uses `husky` command directly, no longer needs `husky install`
- **lint-staged in package.json**: Keep config in package.json for simplicity (no extra file)
- **TypeScript full check**: `tsc --noEmit` checks entire project (necessary for cross-file type safety)
- **Auto-fix behavior**: ESLint and Prettier fix staged files, changes are auto-staged

### Potential Challenges
- **Slow typecheck**: Mitigation - Accept ~5-10s overhead, it's the price of type safety
- **Partial staging**: lint-staged handles partial staging correctly via stash mechanism
- **Windows compatibility**: Husky v9 handles cross-platform; use npm scripts not shell commands

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No Unicode quotes, dashes, or special characters in configuration files.

---

## 9. Testing Strategy

### Unit Tests
- N/A - This session configures tooling, not application code

### Integration Tests
- N/A - Hook behavior tested manually

### Manual Testing
1. **Lint error blocking**: Create `test-lint.ts` with `var x = 1` (should trigger ESLint error)
2. **Format auto-fix**: Create `test-format.ts` with inconsistent spacing, commit, verify fixed
3. **Type error blocking**: Create `test-type.ts` with `const x: number = "string"`
4. **Clean commit**: Modify a file correctly, verify commit succeeds
5. **Fresh setup**: Remove `node_modules` and `.husky`, run `npm install`, verify hooks work

### Edge Cases
- Empty commit (no staged files) - should pass through
- Only non-code files staged (e.g., README.md) - should run Prettier only
- Large number of staged files - should complete in reasonable time

---

## 10. Dependencies

### External Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| `husky` | ^9.0.0 | Git hooks management |
| `lint-staged` | ^15.0.0 | Run linters on staged files |

### Other Sessions
- **Depends on**: `phase00-session01` through `phase00-session04` (all quality tools)
- **Depended by**: All future sessions (quality enforcement active)

---

## 11. npm Scripts Reference

After this session, the project will have these quality-related scripts:

| Script | Command | Purpose |
|--------|---------|---------|
| `lint` | `eslint .` | Check all files for lint errors |
| `lint:fix` | `eslint . --fix` | Fix auto-fixable lint errors |
| `format` | `prettier --write .` | Format all files |
| `format:check` | `prettier --check .` | Check formatting without changing |
| `typecheck` | `tsc --noEmit` | Type check without emitting |
| `test` | `vitest run` | Run tests once |
| `quality` | All checks | Run typecheck + lint + format:check + test |
| `prepare` | `husky` | Set up git hooks (runs on npm install) |

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
