# Contributing

Thank you for your interest in contributing to `@packative/naver-searchad-mcp`!

## Branch Strategy

- **`development`** - Main development branch. All feature branches should be created from and merged into this branch.
- **`master`** - Production branch. Protected. Only accepts merges from `development`. Merging to master triggers automatic versioning and npm publishing.

## Workflow

1. Create a feature branch from `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in campaign listing"
   git commit -m "docs: update README"
   ```

3. Push and create a Pull Request to `development`:
   ```bash
   git push origin feat/your-feature-name
   ```

4. After review and merge to `development`, create a PR from `development` to `master` to trigger a release.

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning and changelog generation.

### Commit Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | Minor (0.x.0) |
| `fix` | Bug fix | Patch (0.0.x) |
| `docs` | Documentation only | Patch |
| `style` | Code style (formatting, etc.) | None |
| `refactor` | Code refactoring | Patch |
| `perf` | Performance improvement | Patch |
| `test` | Adding/updating tests | None |
| `chore` | Maintenance tasks | None |
| `ci` | CI/CD changes | None |
| `build` | Build system changes | None |
| `revert` | Revert previous commit | Patch |

### Breaking Changes

For breaking changes, add `!` after the type or include `BREAKING CHANGE:` in the commit body:

```bash
git commit -m "feat!: remove deprecated API"
# or
git commit -m "feat: new API" -m "BREAKING CHANGE: removed old API"
```

Breaking changes trigger a major version bump (x.0.0).

### Examples

```bash
# New feature
git commit -m "feat: add keyword bid adjustment tool"

# Bug fix
git commit -m "fix: correct signature generation for special characters"

# Documentation
git commit -m "docs: add examples for get_stats tool"

# Breaking change
git commit -m "feat!: change stats response format"
```

## Development Setup

```bash
# Clone the repository
git clone https://github.com/packative/naver-searchad-mcp.git
cd naver-searchad-mcp

# Switch to development branch
git checkout development

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm typecheck

# Build
pnpm build
```

## Release Process

Releases are automated via GitHub Actions:

1. Merge `development` into `master`
2. Release Please creates a release PR with:
   - Version bump in `package.json`
   - Updated `CHANGELOG.md`
3. When the release PR is merged:
   - A GitHub release is created
   - Package is published to npm

## Code Style

- TypeScript strict mode enabled
- Use ES modules
- Follow existing code patterns
- Add tests for new features
- Update documentation as needed

## Questions?

Open an issue on [GitHub](https://github.com/packative/naver-searchad-mcp/issues).
