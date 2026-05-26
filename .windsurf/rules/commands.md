---
trigger: always_on
---

# Otter Framework - Commands

## Build

```bash
yarn build          # Full build (includes TS and JAR targets)
yarn build:ts       # TypeScript-only build (preferred for local dev)
```

## Lint

```bash
yarn lint           # Full lint (mandatory before any PR)
```

## Tests

```bash
yarn test           # Unit tests (mandatory before any PR)
yarn test-e2e       # E2E tests (Playwright)
yarn test-int       # Integration tests (requires Verdaccio)
```

## Per-project commands (Nx)

```bash
yarn nx build <project>
yarn nx lint <project>
yarn nx test <project>
```

## Validation Workflow

Before considering changes complete, always run:

```bash
yarn build      # Full build
yarn lint       # Linting
yarn test       # Unit tests
```
