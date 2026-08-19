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

## AI Skills and Agents

Skills and agents live in `tools/llm/plugins/<plugin>/skills/` and `tools/llm/plugins/<plugin>/agents/`. Each plugin has a corresponding collection file in `collections/`:

| Plugin | Collection file |
|--------|----------------|
| `otter` | `collections/otter.collection.yml` |
| `ama-sdk` | `collections/ama-sdk.collection.yml` |
| `a11y` | `collections/accessibility.collection.yml` |
| `ama-openapi` | `collections/ama-openapi.collection.yml` |

When adding or modifying a skill or agent:

- **Always register new items** in the corresponding `collections/*.collection.yml` — without this, the skill/agent won't be discoverable
- Each entry needs: `path`, `kind` (skill/agent), `title`, `description`, and `tags`
- Place the new entry in the `items` list (order follows the `display.ordering: manual` setting)

## Additional Resources

See [CONTRIBUTING.md](../CONTRIBUTING.md) for complete contribution guidelines.
