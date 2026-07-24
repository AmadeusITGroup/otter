# Accessibility AI Plugin

Skills and agents for WCAG 2.1/2.2 AA conformance, ARIA pattern validation, automated Playwright accessibility tests, and full page audits.

## Skills

| Skill | Description |
|-------|-------------|
| **a11y-aria-patterns** | ARIA roles, patterns, and forbidden anti-patterns for common UI primitives |
| **a11y-axe-playwright** | Write and review axe scans using `@axe-core/playwright`: setup, tag selection, scoping, violations |
| **a11y-keyboard-playwright** | Write keyboard-only test variants and focus management checks using Playwright |
| **a11y-component-audit** | WCAG 2.1/2.2 AA audit gate for UI components: ARIA, keyboard, contrast, reduced motion |
| **a11y-page-checks** | Page-level WCAG checks: heading hierarchy, page title uniqueness, focus on route change |

## Agents

| Agent | Description |
|-------|-------------|
| **a11y-full-page-audit** | Full WCAG 2.1 AA page-level audit combining component and page-level checks into a single evidence block |
| **a11y-write-playwright-tests** | Write missing axe scan and keyboard-only Playwright test files for a component or page |

## Installation

**Claude Code** (CLI or VS Code extension):

```
/plugin marketplace add AmadeusITGroup/otter
/plugin install accessibility
```

**GitHub Copilot in VS Code**

1. Add the marketplace to your user `settings.json`:

   ```json
   "chat.plugins.marketplaces": {
     "AmadeusITGroup/otter": true
   }
   ```

2. Run **Chat: Install Plugin From Source** from the Command Palette and select the **Accessibility** collection.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright) for axe scan tests
- [`@playwright/test`](https://www.npmjs.com/package/@playwright/test) for keyboard and focus tests

## References

- [WCAG documentation](https://www.w3.org/WAI/standards-guidelines/wcag/docs/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [axe rule reference](https://dequeuniversity.com/rules/axe/)
