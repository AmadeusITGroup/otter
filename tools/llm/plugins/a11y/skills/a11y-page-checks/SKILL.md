---
name: a11y-page-checks
description: "Page-level WCAG checks for full-page or route audits: heading hierarchy, page title uniqueness, focus on route change, and axe test coverage."
---

# Skill: Page-Level Accessibility Checks

## Compliance Target

WCAG 2.1 AA for existing pages. WCAG 2.2 AA for newly created pages.

<hard_rules>
1. Page title: each route has a meaningful and unique `<title>`.
2. Heading hierarchy: heading levels must not skip ranks (e.g. `<h1>` → `<h3>` is invalid). Each page must have exactly one `<h1>`.
3. Focus on route/view change: focus moves to the page heading or first interactive element when navigating to a new view.
</hard_rules>

<execution>

**Axe test coverage** — verify a full-page axe test exists for this route (follow [[a11y-axe-playwright]] for conventions). If none exists, record as a finding. Record: `covered` or `missing — no axe test found`.

**Page title**

Confirm the `<title>` is meaningful and unique for this route. Record: `verified` or findings.

**Heading hierarchy**

Confirm no heading levels are skipped and exactly one `<h1>` exists on the page. Record: `verified` or findings.

**Focus on view change**

Confirm the page heading or first interactive element receives focus when the route loads. Record: `verified` or `n/a — no route change`.

**Emit evidence block**

Never omit a bullet — record `n/a — <reason>` when a check does not apply.

```
## Page-Level Accessibility Evidence

- Axe test: <covered | missing>
- Page title: <verified | findings>
- Heading hierarchy: <verified | findings>
- Focus on view change: <verified | n/a — no route change>
```

</execution>

## References

- [WCAG documentation](https://www.w3.org/WAI/standards-guidelines/wcag/docs/)

<reporting_rules>
Run all checks to completion before reporting. After all checks:
- If any findings exist and are not explicitly waived → emit a complete findings list, do NOT emit a passing evidence block.
</reporting_rules>
