---
name: a11y-axe-playwright
description: "Write and review automated axe accessibility scans using @axe-core/playwright: setup, tag selection, selector scoping, interpreting violations, and waiving known rules."
---

# Skill: Axe Scans with Playwright

## Setup

Install the dependency:

```bash
yarn add -D @axe-core/playwright
```

Import in test files:

```typescript
import AxeBuilder from '@axe-core/playwright';
```

## Tag Selection

| Scenario | Tags |
|---|---|
| Existing component or page | `['wcag2a', 'wcag2aa', 'wcag21aa']` |
| New component (WCAG 2.2) | `['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']` |

Never omit tags — an untagged scan runs all rules including experimental ones and produces noise.

## Scoping

Always scope scans to the component under test using `.include()`. Avoid scanning the full page when testing a single component.

```typescript
const results = await new AxeBuilder({ page })
  .include('#my-component-selector')
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .analyze();
```

For full page audits, omit `.include()`:

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .analyze();
```

## When to Run Axe Scans

Run an axe scan at each significant page state transition:
- Initial page load
- After form submission
- After navigation to a new page/view
- After modal/dialog opens
- After dynamic content loads (search results, filtered lists)

## Test Pattern

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('MyComponent accessibility @a11y', () => {
  test('should have no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/my-component-route');

    const results = await new AxeBuilder({ page })
      .include('#my-component-selector')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

## Interpreting Violations

Each violation in `results.violations` contains:

- `id` — axe rule id (e.g. `color-contrast`, `label`, `aria-required-attr`)
- `impact` — `critical`, `serious`, `moderate`, or `minor`
- `description` — what the rule checks
- `nodes` — list of affected elements with `html` snippet and `failureSummary`

Handling by impact level:
- **Critical / serious** — must be fixed before merge
- **Moderate** — track as tech debt
- **Minor** — informational

Log violations for readable output when a test fails:

```typescript
if (results.violations.length > 0) {
  console.log(JSON.stringify(results.violations, null, 2));
}
expect(results.violations).toEqual([]);
```

## Waiving a Known Violation

Only waive a rule when explicitly approved. Record the waiver verbatim in a comment and use `.disableRules()`:

```typescript
const results = await new AxeBuilder({ page })
  .include('#my-component-selector')
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .disableRules(['color-contrast']) // waived: design token pending update — approved by [name] on [date]
  .analyze();
```

Never waive `critical` or `serious` impact rules without documented approval.

## Tag Convention

All accessibility tests must include `@a11y` in the title. This enables filtering:

```bash
npx playwright test --grep "@a11y"
```

## References

- [axe rule reference](https://dequeuniversity.com/rules/axe/)
- [axe-core tag and configuration docs](https://github.com/dequelabs/axe-core/tree/master/doc)

<reporting_rules>
- If asked to waive a `critical` or `serious` rule without documented approval → request explicit sign-off before writing the waiver.
- If no selector is provided for a component-level axe test → ask for the component selector before writing the test.
</reporting_rules>
