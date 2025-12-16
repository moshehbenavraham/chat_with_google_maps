# Session 05: Pre-commit Hooks & Quality Automation

**Session ID**: `phase00-session05-precommit-hooks`
**Status**: Not Started
**Estimated Tasks**: ~15
**Estimated Duration**: 1-2 hours

---

## Objective

Set up pre-commit hooks using Husky and lint-staged to automatically enforce code quality before commits, preventing bad code from entering the repository.

---

## Scope

### In Scope (MVP)
- Install Husky for git hooks
- Install lint-staged for staged file processing
- Configure pre-commit hook to run linting and formatting
- Add type checking to pre-commit
- Configure commit message linting (optional)
- Document the hook setup for contributors

### Out of Scope
- CI/CD pipeline setup (future consideration)
- Pre-push hooks for test running
- Automated release/changelog generation
- Branch protection rules (GitHub settings)

---

## Prerequisites

- [ ] Session 04 completed (Vitest configured)
- [ ] All quality tools working: TypeScript, ESLint, Prettier, Vitest

---

## Deliverables

1. Husky installed and initialized
2. lint-staged configuration
3. Pre-commit hook script
4. Updated npm scripts for manual quality checks
5. Documentation in README or CONTRIBUTING.md

---

## Technical Details

### Dependencies to Install
```bash
npm install -D husky lint-staged
```

### Initialization
```bash
npx husky init
```

### lint-staged Configuration
```json
// package.json or .lintstagedrc
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run lint-staged
npm run typecheck
```

### npm Scripts
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint-staged": "lint-staged",
    "quality": "npm run typecheck && npm run lint && npm run test",
    "prepare": "husky"
  }
}
```

---

## Hook Behavior

### What Runs on Commit
1. **lint-staged**: ESLint --fix and Prettier --write on staged files
2. **typecheck**: Full TypeScript type checking
3. If any step fails, commit is blocked

### Performance Considerations
- lint-staged only processes changed files (fast)
- typecheck runs on whole project (necessary for type safety)
- Total pre-commit time target: <10 seconds

---

## Success Criteria

- [ ] Husky installed and initialized
- [ ] lint-staged configured for TypeScript and other files
- [ ] Pre-commit hook runs linting on staged files
- [ ] Pre-commit hook runs type checking
- [ ] Bad code commits are blocked with clear error messages
- [ ] `npm run quality` runs all checks manually
- [ ] `npm run prepare` sets up hooks after `npm install`
- [ ] Documentation added for contributors
