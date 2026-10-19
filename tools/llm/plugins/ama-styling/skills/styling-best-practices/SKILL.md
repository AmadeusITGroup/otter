---
name: styling-best-practices
description: This skill should be used when developing UI components, writing CSS/SCSS styles, or when the user asks about design tokens, theming, CSS custom properties, or styling conventions. Guides token-first development and Otter extensions usage.
---

# Styling Best Practices

## Core Rule: Token-First

**ALWAYS use design tokens (CSS custom properties) instead of hardcoded values** for colors, spacing, typography, border-radius, shadows, and animation durations.

### Decision Rules

1. Use the `find_design_token` MCP tool to discover available tokens.
2. Apply the following decision tree:

- If token found → recommend it and explain why.
- If multiple tokens match → ask the user to choose.
- If no token matches → ask for more precise intent or broader context.
- If only a primitive matches → prefer a semantic token / ask whether a semantic alias should be created.

## Token Selection Rules

- If an exact component token exists, use it.
- Else if a semantic token exists, use it.
- Else if only a primitive token exists, use it only as a fallback and mention that a semantic token would be better.
- Else ask the user for clarification.

## Fallback Questions

Ask for:
- the visual intent (color, spacing, size, radius, shadow, etc.)
- the semantic meaning (primary, success, danger, neutral, etc.)
- the expected scope (component-specific or global)
- whether a primitive fallback is acceptable

```scss
/* ❌ BAD */
.card { background: #ffffff; padding: 16px; border-radius: 8px; }

/* ✅ GOOD */
.card { background: var(--colors-surface); padding: var(--spacing-md); border-radius: var(--shape-corner-medium); }
```

## Finding Tokens

Use `find_design_token` with the CSS property and a semantic description of the need.
If no results, try broader terms or use `list_design_tokens` to browse by category.

## Otter Extensions (for token JSON definitions)

| Extension | Purpose | Example |
|-----------|---------|---------|
| `o3rPrivate: true` | Internal token, not exposed to CMS | Implementation details |
| `o3rScope: '<selector>'` | Scope CSS property to a selector instead of `:root` | Component-specific tokens |
| `o3rExpectOverride: true` | Token designed to be overridden (theming/rules engine) | Brand colors |
| `o3rImportant: true` | Generates with `!important` (use sparingly) | Legacy CSS specificity battles |
| `o3rUnit: '<unit>'` | Converts unitless value to a CSS unit (`px`, `rem`, `em`, `%`, `vw`, `vh`, `ms`, `s`) | Figma-extracted raw numbers |
| `o3rRatio: <number>` | Applies a multiplier to numeric value | Derived spacing/type scales |
| `o3rMetadata: {...}` | CMS metadata (tags, label, category, component) | Design system portal discoverability |

## Naming Conventions

- **kebab-case**: `colors-primary`, not `colorsPrimary`
- **Structure**: `{category}-{subcategory}-{variant}-{state}`
- **Categories**: `colors-*`, `spacing-*`, `typography-*`, `shape-*`, `elevation-*`, `motion-*`
- **Semantic names**: `colors-primary`, not `blue-500`; `spacing-md`, not `size-3`

## When NOT to Use Tokens

Skip tokens for: one-off layout values, z-index layering, `@keyframes` intermediate values, structural CSS (`display`, `position`, `overflow`), content-coupled dimensions (`max-width: 65ch`).

## Stop Rules

Halt and ask for clarification if:

- No matching token exists for a needed value
- A hardcoded color/spacing is being used where tokens are available
- A primitive token is used where a semantic alternative exists
- A new token needs to be created
