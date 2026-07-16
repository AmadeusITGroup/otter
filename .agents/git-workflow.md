# Git Workflow and CI/CD

## Protected Branches

- `main` - main development branch
- `release/*` - release branches

**Never commit or push directly to these branches.** Always create a feature branch:

- `feat/*` - for new features
- `fix/*` - for bug fixes
- `chore/*` - for maintenance tasks

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/). Rules are defined in `commitlint.config.cts`.

**Format:** `[type]([scope]): concise description`

**Examples:**

```bash
git commit -m "fix: correct null check in service"
git commit -m "feat(core): add new validation helper"
git commit -m "docs: update API documentation"
git commit -m "refactor!: rename config options"  # Breaking change
```

**Rules:**

- Header max length: **100 characters**
- Subject must not be empty or end with a period
- Type and scope must be lowercase
- Common types: `fix`, `feat`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`
- Breaking changes: add `!` after type/scope OR include `breaking` in message

## Versioning

```bash
# Set version for all packages
yarn set:version <version>

# Harmonize versions across package.json files
yarn harmonize:version
```

## CI Contract - Do Not Break

**CRITICAL:** The following must always remain green:

- All required CI jobs: build, lint, unit tests, integration tests, E2E tests
- **Never modify CI workflows** (`.github/workflows/*`) unless explicitly requested
- **Never touch release/versioning/publish flows**: `GitVersion.yml`, release.yml, publish.yml
- **All changes must go through Pull Requests** - never commit directly to main/release branches

## Validation Workflow Before PR

Before considering changes complete, always run:

```bash
yarn build      # Full build (mandatory)
yarn lint       # Linting (mandatory)
yarn test       # Unit tests (mandatory)
```

## Creating a Pull Request

Always follow the repository PR template defined in [`.github/pull_request_template.md`](../.github/pull_request_template.md). When opening a PR, read that file and reproduce its sections in the description, filling in the placeholders:

- Summarize the changes, the related issue, and the motivation/context behind them.
- Link the corresponding issue using one of the template's prefixes so the PR is associated with it. Each PR should be linked to an issue (see [contributing.md](./contributing.md)). If none applies, keep the `*- No issue associated -*` placeholder.

When creating the PR from the CLI, first read `.github/pull_request_template.md` to get its current structure, then pass a body that follows that structure with the placeholders filled in — do not pass the raw template, as it only contains empty sections and comments:

```bash
gh pr create --title "<type>(<scope>): concise description" --body "$(cat <<'EOF'
<body following the template's sections, with the summary and related issue filled in>
EOF
)"
```

The PR title must follow the same [Conventional Commits](https://www.conventionalcommits.org/) format as commit messages.

## Troubleshooting

### Pre-commit hook fails with a PnP resolution error

If a commit fails on the pre-commit hook with an error like:

```
Couldn't find <package>@npm:<version> in the currently installed PnP map - running an install might help
```

the Yarn PnP map is out of date. Run `yarn install`, then retry the commit:

```bash
yarn install
```

This only repairs the local PnP state; it does not change the lockfile when dependencies are unchanged.
