---
trigger: always_on
---

# Otter Framework - Git & CI

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/). Allowed types are defined in `commitlint.config.cts`.

```bash
# Examples
git commit -m "fix: correct null check in service"
git commit -m "feat(core): add new validation helper"
git commit -m "docs: update API documentation"
git commit -m "refactor!: rename config options"  # Breaking change
```

**Rules** (from `commitlint.config.cts`):
- Header max length: **100 characters**
- Subject must not be empty or end with a period
- Type and scope must be lowercase

## CI Contract - Do Not Break

- **All required CI jobs must remain green**: build, lint, unit tests, IT tests, E2E tests
- **Do not modify CI workflows** (`.github/workflows/*`) unless explicitly requested
- **Do not touch release/versioning/publish flows**: `GitVersion.yml`, `release.yml`, `publish.yml`
- **All changes must go through Pull Requests** - never publish directly
