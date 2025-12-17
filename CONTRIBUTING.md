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
3. Run `npm run build` to verify no errors
4. Update documentation if needed
5. Open PR with description
6. Address review feedback
7. Squash and merge

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

- TypeScript strict mode enabled
- Use meaningful variable and function names
- Add comments for complex logic only
- Keep components focused and small

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
