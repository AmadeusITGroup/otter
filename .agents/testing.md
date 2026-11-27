# Testing Guidelines

## Unit Tests

```bash
# Run all unit tests (MANDATORY before any PR)
yarn test

# Run tests for affected packages
yarn test:affected

# Run tests for specific package
yarn nx test <package-name>

# Run tests with coverage (CI mode)
yarn nx test <package-name> --configuration=ci
```

### Test Framework Selection

- **Use Jest** for CommonJS packages (packages without explicit type in package.json or not including .mts files)
- **Use Vitest** for ES module packages (packages with `"type": "module"` in package.json or packages including .mts files)
- **Use Playwright** for E2E tests

### Test File Naming

- Unit tests: `*.spec.ts` (co-located with source files)
- Integration tests: `*.it.spec.ts`
- Vitest tests: `*.test.ts`
- E2E tests: Located in `e2e-playwright/` directories

### Best Practices

- **Add relevant unit tests** for all new code
- **Test behavior, not implementation** - focus on what the code does, not how
- **Use descriptive test names** - clearly state what is being tested
- **Keep tests independent** - each test should be able to run in isolation
- **Mock external dependencies** - use Jest/Vitest mocks for services, HTTP calls, etc.
- **Co-locate tests** with source files (e.g., `foo.service.ts` and `foo.service.spec.ts`)

## Integration Tests

```bash
# Run integration tests
yarn test-int

# Run integration tests for specific package
yarn nx test-int <package-name>
```

Integration tests use Verdaccio (local npm registry) to test package publishing workflows.

## E2E Tests

```bash
# Run E2E tests (Playwright)
yarn test-e2e

# Run E2E tests for specific package
yarn nx test-e2e <package-name>
```

**Important:** E2E tests must pass before merging PRs. Check screenshot update process if visual tests fail (see `apps/showcase/scripts/update-screenshots/readme.md`).

## VSCode Debugging

The repository includes VSCode configuration:
- Use `vscode-jest-tests` debugger task to debug unit tests with breakpoints
- Launch configurations in `.vscode/launch.json`
