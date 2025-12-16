# Session 03: Prettier Formatting

**Session ID**: `phase00-session03-prettier-formatting`
**Status**: Not Started
**Estimated Tasks**: ~15
**Estimated Duration**: 1-2 hours

---

## Objective

Set up Prettier for consistent code formatting across the entire codebase and integrate with ESLint.

---

## Scope

### In Scope (MVP)
- Install Prettier 3.x
- Create Prettier configuration file
- Configure ESLint-Prettier integration
- Format entire codebase
- Add npm scripts for formatting
- Create .prettierignore for build outputs

### Out of Scope
- Editor-specific format-on-save (documented in README)
- Custom Prettier plugins
- Markdown/JSON formatting rules customization

---

## Prerequisites

- [ ] Session 02 completed (ESLint configured)
- [ ] No ESLint errors in codebase

---

## Deliverables

1. `.prettierrc` configuration file
2. `.prettierignore` file
3. ESLint-Prettier integration (no conflicts)
4. npm scripts: `format`, `format:check`
5. All files formatted consistently

---

## Technical Details

### Dependencies to Install
```bash
npm install -D prettier eslint-config-prettier
```

### Configuration
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Ignore Patterns
```
# .prettierignore
dist/
build/
node_modules/
coverage/
*.min.js
```

### ESLint Integration
Add `eslint-config-prettier` to disable conflicting rules:
```javascript
// eslint.config.js
import prettier from 'eslint-config-prettier';

export default [
  // ... other configs
  prettier,
];
```

---

## Success Criteria

- [ ] Prettier 3.x installed and configured
- [ ] `.prettierrc` with project-appropriate settings
- [ ] `.prettierignore` excluding build artifacts
- [ ] `npm run format` formats all files
- [ ] `npm run format:check` passes (CI-ready)
- [ ] No conflicts between ESLint and Prettier rules
- [ ] All source files formatted consistently
