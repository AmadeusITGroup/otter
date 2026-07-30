# Linting

```bash
# Lint all packages (MANDATORY before any PR)
yarn lint

# Lint affected packages
yarn lint:affected

# Lint specific package
yarn nx lint <package-name>

# Lint with cache (CI mode)
yarn nx lint <package-name> --configuration=ci

# Lint project.json files
yarn lint:project-json
```

## Configuration

The project uses ESLint with flat config (`eslint.config.mjs`).

**Configuration files:**
- Root: `eslint.config.mjs`, `eslint.shared.config.mjs`, `eslint.local.config.mjs`
- Package-specific: `packages/@o3r/eslint-config/`, `packages/@o3r/eslint-plugin/`

**Linter tasks must pass before submitting PRs.**

## Husky Git Hooks

The project uses Husky for git hooks:
- Pre-commit: runs lint-staged (ESLint, editorconfig-checker)
- Commit message validation: uses commitlint with conventional commits
