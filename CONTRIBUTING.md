# Contributing

## Branch Conventions

- `main` - Production-ready code
- `develop` - Integration branch (if used)
- `feature/*` - New features
- `fix/*` - Bug fixes

## Commit Style

Use conventional commits:

| Prefix      | Purpose           |
| ----------- | ----------------- |
| `feat:`     | New feature       |
| `fix:`      | Bug fix           |
| `docs:`     | Documentation     |
| `refactor:` | Code refactoring  |
| `test:`     | Adding tests      |
| `chore:`    | Maintenance tasks |

Example:

```
feat: add dark mode toggle to settings panel
```

## Pull Request Process

1. Create feature branch from `main`
2. Make changes with clear commits
3. Run quality checks before pushing:
   ```bash
   npm run quality  # Runs typecheck, lint, format:check, test
   ```
4. Update documentation if needed
5. Open PR with description
6. Address review feedback
7. Squash and merge

## Pre-commit Hooks

This project uses Husky and lint-staged to run quality checks on staged files:

- **TypeScript/TSX files**: ESLint + Prettier
- **JSON/MD/CSS/HTML files**: Prettier

Hooks run automatically on `git commit`. If checks fail, fix the issues before committing.

## Development Setup

```bash
# Clone and install
git clone <repository-url>
cd chat_with_google_maps
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev
```

See [Local Deployment](./docs/LOCAL_DEPLOYMENT.md) for detailed setup instructions.

## Code Style

- TypeScript strict mode enabled (`noUncheckedIndexedAccess`, `noImplicitReturns`)
- ESLint with `strictTypeChecked` and `stylisticTypeChecked` presets
- Prettier for consistent formatting
- Use meaningful variable and function names
- Add comments for complex logic only
- Keep components focused and small

## Quality Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run lint`          | Run ESLint                     |
| `npm run lint:fix`      | Run ESLint with auto-fix       |
| `npm run format`        | Format code with Prettier      |
| `npm run format:check`  | Check code formatting          |
| `npm run typecheck`     | Run TypeScript type checking   |
| `npm run test`          | Run tests                      |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run quality`       | Run all quality checks         |

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── stores/         # Zustand state management
├── lib/            # Utilities organized by domain
│   ├── api/        # API clients
│   ├── audio/      # Audio processing
│   ├── map/        # Map utilities
│   ├── prompts/    # AI prompt definitions
│   ├── tools/      # Function calling tools
│   └── worklets/   # Audio worklets
└── types/          # Global TypeScript types
```

## Adding New Features

### New Persona/Prompt

See [Prompts Guide](./docs/PROMPTS.md) for creating new AI personas.

### New Tool

See [Customization Guide](./docs/CUSTOMIZATION.md) for adding function-calling tools.

## Questions

For questions about the codebase, refer to:

- [Architecture](./docs/ARCHITECTURE.md) - System design
- [Customization](./docs/CUSTOMIZATION.md) - Extending functionality
