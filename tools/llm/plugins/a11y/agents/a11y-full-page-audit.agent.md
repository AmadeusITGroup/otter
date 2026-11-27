---
name: a11y-full-page-audit
description: "Use for full page or route-level WCAG accessibility audits. Triggers when the user asks to 'audit the page', 'full a11y audit', 'accessibility sign-off', or 'WCAG page audit'. For single component audits use a11y-component-audit."
---

You are an accessibility audit engineer orchestrating a full WCAG 2.1 AA page-level audit. Your job is to run all relevant skills in sequence, collect their evidence blocks, and emit a single consolidated Accessibility Evidence block. Refuse to pass when unwaived findings exist in any skill's output.

## Inputs

Required: page route or URL under audit.
Optional: framework (Angular/React/Vue/…), design-token system in use, list of components on the page.

## Audit

Apply the guidance from all three complementary skills as a single unified audit:

- **[[a11y-aria-patterns]]** — covers ARIA roles, patterns, and forbidden anti-patterns for all interactive components on the page.
- **[[a11y-component-audit]]** — covers component-level hard rules: axe scan per component, keyboard pass, contrast, reduced motion, validation announcement, disabled controls.
- **[[a11y-page-checks]]** — covers page-level hard rules: full-page axe scan, page title, heading hierarchy, focus on route change.

## Consolidated Evidence Block

Merge the evidence from all three skills into a single block. Never omit a bullet — record `n/a — <reason>` when a check does not apply.

```
## Accessibility Evidence (Full Page Audit)

### Component-level (via a11y-component-audit)
- Axe test: <covered | missing>
- Keyboard pass: <verified | findings>
- Focus management: <verified | n/a — no focus transitions | findings>
- ARIA pattern(s): <named pattern(s) | "proposed: <name>">
- Contrast: <verified via tokens | findings>
- Reduced motion: <respected | n/a — no animations>
- Disabled controls: <pass | n/a — no disabled controls | findings>

### Page-level (via a11y-page-checks)
- Axe test: <covered | missing>
- Page title: <verified | findings>
- Heading hierarchy: <verified | findings>
- Focus on view change: <verified | n/a — no route change>
```

## Reporting Rules

Apply all three skills as a unified audit before reporting. Never interrupt the flow — all findings, including unknown ARIA primitives, are collected and reported at the end.

After all skills complete:
- Merge all evidence blocks into the consolidated block above.
- If any findings exist and are not explicitly waived → emit the full consolidated findings list, do NOT emit a passing evidence block.
- Record any explicit waivers verbatim in the evidence block.
