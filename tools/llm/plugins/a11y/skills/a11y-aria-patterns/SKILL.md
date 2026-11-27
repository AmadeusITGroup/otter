---
name: a11y-aria-patterns
description: "Reference for ARIA roles, patterns, and forbidden anti-patterns for common UI primitives (button, modal, tabs, combobox, etc.)."
---

# Skill: ARIA Patterns Reference

Provide ARIA role patterns and mandatory behaviors for common UI primitives, and flag forbidden anti-patterns. This skill is a reference and review gate — it does not run automated checks.

## ARIA Patterns for Common UI Primitives

| Primitive | Pattern | Mandatory behaviors |
|---|---|---|
| Button (icon-only) | `<button>` with `aria-label` | Descriptive label; no `title` as accessible name — hover-only, unreachable by keyboard and touch |
| Toggle / switch | `role="switch"` | `aria-checked`; keyboard: Space toggles |
| Disclosure / accordion | `<button aria-expanded>` controlling region | `aria-controls`; Enter/Space toggles; region has `id` |
| Tabs | `role="tablist"` + `role="tab"` + `role="tabpanel"` | `aria-selected`; arrow keys navigate tabs; Tab moves into panel |
| Modal / dialog | `role="dialog"` + `aria-modal="true"` | Focus trap; `aria-labelledby`; Escape closes; focus restored on close; apply `inert` on background content (`aria-modal="true"` alone is not honored by all browsers) |
| Tooltip | `role="tooltip"` + `aria-describedby` | Appears on focus AND hover; not the only accessible name |
| Menu / dropdown | `role="menu"` + `role="menuitem"` | Arrow keys navigate; Escape closes; Enter/Space activates |
| Combobox / autocomplete | `role="combobox"` + `role="listbox"` | `aria-expanded`; `aria-activedescendant`; arrow keys move selection |
| Date picker | Dialog containing `role="grid"` | Focus trap; Escape closes; arrow keys move date; `aria-current="date"` for today |
| Table / data grid | `<table>` or `role="grid"` | Column/row headers (`scope` or `aria-label`); `aria-sort` on sortable headers |
| Alert / toast | `role="alert"` (error) or `role="status"` (info) | Not added to DOM before needed; auto-dismiss disabled when action present; minimum 5 s display |
| Form validation error | `role="alert"` or `aria-live="polite"` on error container | Invalid control has `aria-invalid="true"` + `aria-describedby` pointing to the error message |
| Loading / skeleton | `aria-busy="true"` on region | Live-region announces completion only when meaningful to the user |
| Progress bar | `role="progressbar"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; label via `aria-label` or `aria-labelledby` |

When a new primitive not in this table is introduced → record it as a finding in the report with a proposed pattern and rationale. Do not block the audit.

## Forbidden Patterns

- Removing focus outlines without a conformant replacement
- `tabindex > 0` (breaks natural tab order)
- Click handlers on non-interactive elements (`<div onClick>`) without `role`, `tabindex="0"`, and keyboard handlers
- Mouse/touch actions not reachable by keyboard alone — every interaction must be operable via Tab, Shift+Tab, Enter, Space, Escape, or Arrow keys as appropriate
- Announcing every state change via live region (use only for meaningful user-facing updates)
- `display: none` / `visibility: hidden` for content that should be AT-visible — use a visually-hidden technique (`position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%)`) instead
- Raw hex colors in style rules (use design tokens)
- Text embedded in `<svg>` or images without accessible alternative

## References

- [ARIA Authoring Practices Guide — Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)

<reporting_rules>
- After review: if findings exist and are not explicitly waived → emit a findings list, do NOT emit a passing report.
- If a forbidden pattern is found: name the rule and propose a conformant alternative. Record any explicit waiver verbatim.
</reporting_rules>
