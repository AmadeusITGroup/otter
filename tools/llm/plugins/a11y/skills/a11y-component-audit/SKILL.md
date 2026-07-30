---
name: a11y-component-audit
description: "Audit UI components for WCAG 2.1/2.2 AA conformance: ARIA patterns, keyboard navigation, color contrast, and accessibility evidence block."
---

# Skill: Component Accessibility Audit

## Compliance Target

WCAG 2.1 AA for existing components. WCAG 2.2 AA for newly created components. Accessibility is a release gate, not a follow-up.

<hard_rules>
1. Apply [[a11y-aria-patterns]] for accessible names, keyboard behavior, focus outlines, and validation ARIA.
2. Form controls: programmatic label (`<label for="[id]">` or `aria-labelledby`). Placeholder is NOT a label.
3. No color-only information: status, error, and category indicators carry text or icon in addition to color.
4. Contrast: text 4.5:1 (3:1 for large text ≥18px or ≥14px bold), UI components and focus indicators 3:1. Use design tokens — no raw hex values.
5. Reduced motion: animations longer than 200 ms must respect `prefers-reduced-motion: reduce`.
6. No tooltip on disabled controls: use a visible sibling message with `aria-describedby` instead.
7. Images and icons: decorative images use `alt=""` or `aria-hidden="true"`; informative images have descriptive `alt` text; functional images describe their purpose, not appearance; never prefix with "image of" or "icon of".
</hard_rules>

<execution>

**Axe test coverage** — verify an axe test exists for the component (follow [[a11y-axe-playwright]] for conventions). If none exists, record as a finding. Record: `covered` or `missing — no axe test found`.

**Keyboard pass** — follow [[a11y-keyboard-playwright]] for patterns and helpers. Record: `verified` or findings list.

**ARIA pattern validation** — validate each changed component against [[a11y-aria-patterns]]. Do NOT improvise ARIA roles. Record: named pattern(s) or finding with proposed pattern.

**Contrast verification**

Confirm all colors use design tokens (no raw hex). Run token contrast linter if available. Record: `verified via tokens` or findings list.

**Reduced motion check**

Confirm every animation > 200 ms has a `prefers-reduced-motion: reduce` rule. Record: `respected` or `n/a — no animations`.

**Disabled controls** (only if the component includes disabled form controls)

Verify no tooltip is attached to a disabled control — use a visible sibling message with `aria-describedby` instead. Record: `pass` or findings.

**Emit evidence block**

Never omit a bullet — record `n/a — <reason>` when a check does not apply.

```
## Accessibility Evidence

- Axe test: <covered | missing>
- Keyboard pass: <verified | findings>
- Focus management: <verified | n/a — no focus transitions | findings>
- ARIA pattern(s): <named pattern(s) | "proposed: <name>">
- Contrast: <verified via tokens | findings>
- Reduced motion: <respected | n/a — no animations>
- Disabled controls: <pass | n/a — no disabled controls | findings>
```

</execution>

## References

- [WCAG documentation](https://www.w3.org/WAI/standards-guidelines/wcag/docs/)

<reporting_rules>
Run all checks to completion before reporting. After all checks:
- If any findings exist and are not explicitly waived → emit a complete findings list, do NOT emit a passing evidence block.
- If a forbidden pattern is found → name the rule, propose a conformant alternative, record any explicit waiver verbatim.
</reporting_rules>
