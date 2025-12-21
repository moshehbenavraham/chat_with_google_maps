# Development Guide

## Local Environment

### Required Tools

- Node.js v18+
- npm v8+

### Port Mappings

| Service         | Port | URL                   |
| --------------- | ---- | --------------------- |
| Vite Dev Server | 3003 | http://localhost:3003 |
| API Server      | 3011 | http://localhost:3011 |
| PostgreSQL      | 5438 | localhost:5438        |

## Dev Scripts

| Command                 | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Start development server with hot reload                        |
| `npm run build`         | Build for production                                            |
| `npm run preview`       | Preview production build                                        |
| `npm run lint`          | Run ESLint                                                      |
| `npm run lint:fix`      | Run ESLint with auto-fix                                        |
| `npm run format`        | Format code with Prettier                                       |
| `npm run format:check`  | Check code formatting                                           |
| `npm run typecheck`     | Run TypeScript type checking                                    |
| `npm run test`          | Run tests                                                       |
| `npm run test:watch`    | Run tests in watch mode                                         |
| `npm run test:coverage` | Run tests with coverage report                                  |
| `npm run quality`       | Run all quality checks (typecheck + lint + format:check + test) |
| `npm run db:start`      | Start PostgreSQL container                                      |
| `npm run db:stop`       | Stop PostgreSQL container                                       |
| `npm run db:migrate`    | Apply database migrations                                       |
| `npm run db:reset`      | Reset database (deletes data)                                   |

## Development Workflow

1. Pull latest `main`
2. Start database: `npm run db:start`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Make changes
5. Run quality checks: `npm run quality`
6. Commit (pre-commit hooks run automatically)
7. Open PR

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

Test files are located alongside source files with `.test.ts` or `.test.tsx` extension.

## Pre-commit Hooks

Husky runs lint-staged on commit:

- TypeScript/TSX files: ESLint + Prettier
- JSON/MD/CSS/HTML files: Prettier

If hooks fail, fix issues before committing.

## Code Quality

The project uses strict TypeScript and ESLint:

- `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess`, `noImplicitReturns`
- `eslint.config.js`: `strictTypeChecked`, `stylisticTypeChecked`
- `.prettierrc`: Consistent formatting rules

## Debugging

### TypeScript errors

```bash
npm run typecheck
```

### Lint errors

```bash
npm run lint
```

### Formatting issues

```bash
npm run format
```

## Related Documentation

- [Local Deployment](./LOCAL_DEPLOYMENT.md) - Full setup instructions
- [Architecture](./ARCHITECTURE.md) - System design
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines
