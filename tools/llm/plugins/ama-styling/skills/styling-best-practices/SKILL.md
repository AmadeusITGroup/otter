---
name: styling-best-practices
description: This skill should be used when developing UI components, writing CSS/SCSS styles, or when the user asks about design tokens, theming, CSS custom properties, or styling conventions. Guides token-first development and Otter extensions usage.
---

# Styling Best Practices

Comprehensive guide for token-first component styling, Otter extensions, and design system conventions.

## 1. Token-First Principle

**ALWAYS use design tokens (CSS custom properties) instead of hardcoded values.**

Before writing any style that involves color, spacing, typography, border-radius, shadow, or animation duration:

1. Use the `find_design_token` MCP tool to discover available tokens.
2. If a matching token exists, use it via `var(--token-name)`.
3. If no token exists, **flag it to the user** — do not hardcode a raw value.

```scss
/* ❌ BAD — hardcoded values */
.card {
  background: #ffffff;
  color: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
}

/* ✅ GOOD — design tokens */
.card {
  background: var(--colors-surface);
  color: var(--colors-on-surface);
  border-radius: var(--shape-corner-medium);
  padding: var(--spacing-md);
}
```

## 2. Token Hierarchy

Tokens are organized in layers. **Always prefer the most semantic layer available:**

```
Primitive tokens       →  Raw values, no context
(--colors-blue-500)       Use only as building blocks in token definitions

Semantic tokens        →  Purpose-based, context-aware
(--colors-primary)        Preferred for component styles

Component tokens       →  Scoped to a specific component
(--button-background)     Use for component-level customization API
```

### Decision flow:

1. **Component token** exists for this exact use case? → Use it.
2. **Semantic token** describes the intent? → Use it.
3. **Primitive token** only? → Consider requesting a semantic alias first.
4. **No token at all?** → Stop and flag to the user.

## 3. Finding Tokens

Use the `find_design_token` MCP tool to search for tokens:

- Provide the **CSS property** you are styling (e.g., `background-color`, `font-size`, `border-radius`).
- Describe **semantically** what you need (e.g., "primary action background", "body text size", "card corner radius").

### Examples:

| Need | Tool query |
|------|-----------|
| Background for a primary button | `find_design_token` with property `background-color`, description "primary action" |
| Text color on dark surfaces | `find_design_token` with property `color`, description "text on dark surface" |
| Standard spacing between cards | `find_design_token` with property `gap`, description "medium content spacing" |

If `find_design_token` returns no results:
- Try broader terms (e.g., "surface" instead of "card background")
- Use `list_design_tokens` to browse by category
- If truly no token exists, inform the user: _"No design token found for [use case]. Should I create a token definition or use a hardcoded value as a temporary measure?"_

## 4. Otter Extensions

Otter extensions add metadata and behavior to tokens in the Style Dictionary source files. Use them in token JSON definitions:

### `o3rPrivate: true`

Marks a token as **internal** — not exposed to CMS or external configuration.

```json
{
  "internal-grid-gap": {
    "value": "4px",
    "o3rPrivate": true
  }
}
```

Use when: The token is an implementation detail not meant for business users to override.

### `o3rScope: '<selector>'`

Scopes a token's CSS custom property to a **specific selector** instead of `:root`.

```json
{
  "card-shadow": {
    "value": "0 2px 8px rgba(0,0,0,0.1)",
    "o3rScope": ".o3r-card"
  }
}
```

Use when: A token only makes sense within a specific component's DOM subtree.

### `o3rExpectOverride: true`

Signals that this token is **designed to be overridden** by theming or rules engine.

```json
{
  "brand-primary": {
    "value": "#0066cc",
    "o3rExpectOverride": true
  }
}
```

Use when: The token is a theming hook — its value will change per brand, locale, or runtime rule.

### `o3rImportant: true`

Generates the CSS custom property with `!important`. **Use sparingly.**

```json
{
  "override-bg": {
    "value": "{colors.white}",
    "o3rImportant": true
  }
}
```

Use when: The token must win specificity battles in legacy or third-party CSS contexts. Prefer refactoring specificity over using this.

### `o3rUnit: '<unit>'`

Converts a unitless numeric token to a specific CSS unit in the output.

```json
{
  "spacing-base": {
    "value": "16",
    "o3rUnit": "px"
  }
}
```

Supported units: `px`, `rem`, `em`, `%`, `vw`, `vh`, `ms`, `s`.

Use when: Token values are stored as raw numbers (common when extracted from Figma) and need unit conversion at build time.

### `o3rRatio: <number>`

Applies a **multiplier** to a numeric token value.

```json
{
  "spacing-lg": {
    "value": "{spacing.base}",
    "o3rRatio": 1.5
  }
}
```

Use when: You need derived values from a base scale (e.g., spacing scale, type scale).

### `o3rMetadata`

Attaches CMS metadata for design system management interfaces.

```json
{
  "button-primary-bg": {
    "value": "{colors.primary}",
    "o3rMetadata": {
      "tags": ["button", "primary"],
      "label": "Primary Button Background",
      "category": "Action Colors",
      "component": "ButtonComponent"
    }
  }
}
```

Use when: Tokens need to be discoverable and editable in a CMS or design system portal.

## 5. Naming Conventions

Follow these rules for token names:

- **kebab-case** always: `colors-primary`, not `colorsPrimary` or `Colors_Primary`
- **Hierarchical** structure: `{category}-{subcategory}-{variant}-{state}`
- **Category first**: groups related tokens (`colors-*`, `spacing-*`, `typography-*`, `shape-*`)
- **Descriptive variants**: use semantic names, not indexes (`-primary`, `-surface`, not `-1`, `-2`)

### Examples:

| Token | Purpose |
|-------|---------|
| `colors-primary` | Brand primary color |
| `colors-on-primary` | Text/icon color on primary surfaces |
| `colors-surface-elevated` | Elevated surface background |
| `spacing-xs` | Extra-small spacing (4px) |
| `spacing-md` | Medium spacing (16px) |
| `typography-body-size` | Body text font size |
| `typography-heading-weight` | Heading font weight |
| `shape-corner-small` | Small border radius |
| `elevation-shadow-md` | Medium elevation shadow |
| `motion-duration-fast` | Fast animation duration |

### Anti-patterns:

- ❌ `blue-500` as a semantic name (use `colors-primary` instead)
- ❌ `size-3` (meaningless — use `spacing-md` or `typography-body-size`)
- ❌ `btnBg` (abbreviations, camelCase — use `button-background`)

## 6. Component Styling Patterns

### Basic component with token-based custom properties

```scss
:host {
  // Define component-level custom properties backed by semantic tokens
  --component-background: var(--colors-surface);
  --component-text: var(--colors-on-surface);
  --component-border: var(--colors-outline);
  --component-radius: var(--shape-corner-medium);
  --component-padding: var(--spacing-md);

  // Apply them
  display: block;
  background: var(--component-background);
  color: var(--component-text);
  border: 1px solid var(--component-border);
  border-radius: var(--component-radius);
  padding: var(--component-padding);
}
```

### Interactive states

```scss
:host {
  --button-bg: var(--colors-primary);
  --button-text: var(--colors-on-primary);
  --button-bg-hover: var(--colors-primary-hover);
  --button-bg-active: var(--colors-primary-active);
  --button-bg-disabled: var(--colors-disabled);
  --button-text-disabled: var(--colors-on-disabled);
}

.button {
  background: var(--button-bg);
  color: var(--button-text);
  transition: background var(--motion-duration-fast) var(--motion-easing-standard);

  &:hover {
    background: var(--button-bg-hover);
  }

  &:active {
    background: var(--button-bg-active);
  }

  &:disabled {
    background: var(--button-bg-disabled);
    color: var(--button-text-disabled);
    cursor: not-allowed;
  }
}
```

### Responsive token usage

```scss
:host {
  --card-padding: var(--spacing-sm);
  --card-gap: var(--spacing-xs);

  @media (min-width: 768px) {
    --card-padding: var(--spacing-md);
    --card-gap: var(--spacing-sm);
  }

  @media (min-width: 1200px) {
    --card-padding: var(--spacing-lg);
    --card-gap: var(--spacing-md);
  }
}
```

### Theming via token override

```scss
// Dark theme variant — override semantic tokens at component level
:host(.dark-theme) {
  --component-background: var(--colors-surface-dark);
  --component-text: var(--colors-on-surface-dark);
}
```

## 7. Accessibility

### Color contrast

- **Text:** Use semantic color pairs (`--colors-on-surface` on `--colors-surface`) that guarantee WCAG AA (4.5:1 for normal text, 3:1 for large text).
- **Interactive elements:** Ensure focus indicators have 3:1 contrast against adjacent colors.
- **Never hardcode colors** — semantic tokens handle light/dark mode contrast automatically.

### Motion

```scss
// Always respect reduced-motion preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// Or per-component:
:host {
  transition: transform var(--motion-duration-standard) var(--motion-easing-standard);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
```

### Font sizing

- **Use `rem` or `em`** for font sizes — never `px`. This respects user browser settings.
- Use the `o3rUnit: 'rem'` extension to convert numeric tokens automatically.
- Token example: `typography-body-size: 1rem`, `typography-heading-size: 1.5rem`

### Focus indicators

```scss
:host(:focus-visible) {
  outline: 2px solid var(--colors-focus-ring);
  outline-offset: 2px;
}
```

## 8. When NOT to Use Tokens

Not every CSS value needs a token. Skip tokens for:

- **One-off layout values** — specific margins for alignment hacks, `calc()` expressions combining multiple tokens, grid template definitions unique to one layout.
- **Z-index layering** — use a z-index scale map or SCSS variables local to the application, not design tokens. Token systems don't manage stacking context well.
- **Animation keyframe intermediate values** — `@keyframes` percentages and transform values are animation-specific, not reusable across components.
- **Structural CSS** — `display`, `position`, `overflow`, `pointer-events` are layout mechanics, not design decisions.
- **Dimensions tightly coupled to content** — `max-width: 65ch` for readability, `aspect-ratio: 16/9` for media containers.

## 9. Stop Rules

**Halt and ask for clarification** before proceeding if:

- ⚠️ **No matching token exists** for a color, spacing, typography, or shape value you need.
- ⚠️ **A hardcoded color** (`#hex`, `rgb()`, `hsl()`) is being used in component styles.
- ⚠️ **A component bypasses the token system** (uses raw values where tokens are available).
- ⚠️ **A primitive token** is used where a semantic alternative exists.
- ⚠️ **A new token is needed** — propose the name and value following naming conventions before creating it.

When stopped, ask:
> "I found [issue]. Should I: (a) create a new token `--suggested-name` with value `X`, (b) use an existing token `--alternative`, or (c) proceed with a hardcoded value and add a TODO?"
