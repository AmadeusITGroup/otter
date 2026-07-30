# Contributing Rules

## For Minor Versions

- **Make only non-breaking changes**
- Enhancements to existing code are possible - discuss beforehand with the Otter team via a feature request
- If replacing an existing feature, **deprecate the old code** in minor versions
  - Add `@deprecated` tag in JSDoc
  - Mention the major version when it will be removed
  - Note: Only **even** major Otter versions allow **costly breaking changes**
  - A breaking change can be effective only from major version `n + 2` **after the deprecation**

## Quality Requirements

- Linter tasks must pass
- Add relevant unit tests
- E2E tests must pass (check screenshot update process if visual tests fail)
- Any change should be followed by changes in the generator whenever applicable
- Properties should have the most restricted type possible
- Always write description comments for methods and properties

## PR Review Process

- All PRs require approval from the Otter team (@AmadeusITGroup/otter_admins)
- Link corresponding issue in PR description
- Follow the PR template
- Ensure all CI checks pass

## Additional Resources

See [CONTRIBUTING.md](../CONTRIBUTING.md) for complete contribution guidelines.
