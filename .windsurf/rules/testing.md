---
trigger: always_on
---

# Otter Framework - Testing Requirements

## General Testing Guidelines

- **Add relevant unit tests** for all new code
- **E2E tests must pass** - check screenshot update process if visual tests fail
- **Follow existing test patterns** in the codebase

## Test Frameworks

- **Use Jest** for unit tests
- **Use Playwright** for e2e tests

## Test File Naming

- Unit tests: `*.spec.ts` (co-located with source files)
- E2E tests: Located in `e2e-playwright/` directories

## Best Practices

- **Test behavior, not implementation** - focus on what the code does, not how
- **Use descriptive test names** - clearly state what is being tested
- **Keep tests independent** - each test should be able to run in isolation
- **Mock external dependencies** - use Jest mocks for services, HTTP calls, etc.