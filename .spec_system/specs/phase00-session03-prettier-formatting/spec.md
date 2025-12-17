# Session Specification

**Session ID**: `phase00-session03-prettier-formatting`
**Phase**: 00 - Developer Tooling & Quality Foundation
**Status**: Not Started
**Created**: 2025-12-17

---

## 1. Session Overview

This session establishes Prettier as the code formatting standard for the Chat with Google Maps project. Prettier is an opinionated code formatter that ensures consistent code style across all developers and eliminates debates about formatting preferences. By integrating with the existing ESLint configuration, we create a seamless development experience where linting and formatting work together without conflicts.

Code formatting consistency is critical for team collaboration and code reviews. Without automated formatting, developers spend time manually adjusting whitespace, quotes, and semicolons - time better spent on actual problem-solving. Prettier eliminates this overhead by enforcing a single formatting standard that applies to every file in the repository.

This session is a prerequisite for Session 04 (Vitest Testing) and Session 05 (Pre-commit Hooks). The pre-commit hooks will rely on Prettier being properly configured to automatically format staged files before commits. By establishing formatting standards now, all future code - including tests - will follow consistent conventions from the start.

---

## 2. Objectives

1. Install and configure Prettier 3.x with project-appropriate formatting rules
2. Integrate Prettier with ESLint using `eslint-config-prettier` to disable conflicting rules
3. Create npm scripts for formatting (`format`, `format:check`) that can be used in CI
4. Format the entire existing codebase (~35 TypeScript/TSX files) to establish baseline consistency

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-typescript-strict-mode` - TypeScript strict configuration
- [x] `phase00-session02-eslint-configuration` - ESLint 9 with TypeScript-ESLint configured

### Required Tools/Knowledge
- Node.js and npm (already installed)
- Understanding of ESLint flat config format (eslint.config.js)

### Environment Requirements
- Access to project root directory
- npm install permissions

---

## 4. Scope

### In Scope (MVP)
- Install Prettier 3.x and eslint-config-prettier
- Create `.prettierrc` configuration file with project-appropriate settings
- Create `.prettierignore` file to exclude build artifacts
- Update `eslint.config.js` to include eslint-config-prettier
- Add npm scripts: `format`, `format:check`
- Format all existing source files to establish baseline
- Verify no conflicts between ESLint and Prettier

### Out of Scope (Deferred)
- Editor-specific format-on-save configuration - *Reason: Developer choice, documented in README*
- Custom Prettier plugins (e.g., for imports sorting) - *Reason: Adds complexity, can be added later*
- Markdown/JSON formatting rule customization - *Reason: Defaults are acceptable*
- Pre-commit hook integration - *Reason: Session 05 scope*

---

## 5. Technical Approach

### Architecture
Prettier operates as a standalone code formatter that runs independently of ESLint. To prevent conflicts where ESLint rules contradict Prettier's formatting decisions, we use `eslint-config-prettier` which disables all ESLint rules that would conflict with Prettier. This creates a clear separation of concerns:

- **ESLint**: Code quality rules (unused variables, type safety, React hooks)
- **Prettier**: Code formatting (whitespace, quotes, semicolons, line length)

### Design Patterns
- **Configuration-as-code**: `.prettierrc` file versioned in repository
- **Ignore patterns**: `.prettierignore` mirrors `.gitignore` patterns for build artifacts
- **Flat config integration**: `eslint-config-prettier` added as last config in ESLint array

### Technology Stack
- Prettier 3.x (latest stable)
- eslint-config-prettier 10.x (for ESLint 9 compatibility)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `.prettierrc` | Prettier configuration (JSON format) | ~10 |
| `.prettierignore` | Files/directories to skip formatting | ~8 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `package.json` | Add devDependencies and npm scripts | ~8 |
| `eslint.config.js` | Import and add eslint-config-prettier | ~4 |
| `src/**/*.{ts,tsx}` | Formatting applied (automated) | ~35 files |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Prettier 3.x installed and configured
- [ ] `.prettierrc` exists with project-appropriate settings
- [ ] `.prettierignore` excludes dist/, node_modules/, coverage/
- [ ] `npm run format` formats all files without errors
- [ ] `npm run format:check` exits 0 (all files formatted)
- [ ] `npm run lint` passes (no ESLint-Prettier conflicts)

### Testing Requirements
- [ ] Run `npm run format:check` - should pass
- [ ] Run `npm run lint` - should pass with no conflicts
- [ ] Manually modify a file's formatting, run `npm run format`, verify it's fixed

### Quality Gates
- [ ] All configuration files use ASCII-only characters (0-127)
- [ ] Unix LF line endings in all created files
- [ ] No TypeScript errors introduced
- [ ] No ESLint errors introduced

---

## 8. Implementation Notes

### Key Considerations
- **Formatting choices**: Use widely-accepted defaults (single quotes, 2-space indent, trailing commas) that align with common TypeScript/React conventions
- **Print width**: 100 characters balances readability with modern wide screens
- **Arrow parens**: `avoid` for cleaner single-parameter arrows (common in React)
- **Order matters**: `eslint-config-prettier` MUST be last in ESLint config array

### Potential Challenges
- **Large initial diff**: First format commit will touch many files - this is expected and acceptable
- **Conflicting rules**: If `npm run lint` fails after adding prettier config, investigate which ESLint rule conflicts

### ASCII Reminder
All output files must use ASCII-only characters (0-127). The `.prettierrc` and `.prettierignore` files contain only standard ASCII.

---

## 9. Testing Strategy

### Unit Tests
- N/A - This session configures tooling, not application code

### Integration Tests
- Run `npm run format:check` to verify all files match Prettier's formatting
- Run `npm run lint` to verify no conflicts between ESLint and Prettier

### Manual Testing
1. Intentionally break formatting in a .tsx file (add extra spaces, change quotes)
2. Run `npm run format`
3. Verify the file is restored to correct formatting
4. Run `npm run format:check` - should pass

### Edge Cases
- Files with unusual formatting should be handled gracefully
- JSX formatting should work correctly with React components
- TypeScript type annotations should format properly

---

## 10. Dependencies

### External Libraries
| Package | Version | Purpose |
|---------|---------|---------|
| `prettier` | ^3.x | Code formatter |
| `eslint-config-prettier` | ^10.x | Disable conflicting ESLint rules |

### Other Sessions
- **Depends on**: `phase00-session02-eslint-configuration` (ESLint must be configured first)
- **Depended by**: `phase00-session04-vitest-testing`, `phase00-session05-precommit-hooks`

---

## 11. Configuration Reference

### Prettier Configuration (.prettierrc)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Prettier Ignore (.prettierignore)
```
dist/
build/
node_modules/
coverage/
*.min.js
.spec_system/
```

### ESLint Integration
```javascript
// eslint.config.js - add at the end
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // ... existing configs
  prettier, // Must be last
);
```

### Package.json Scripts
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
