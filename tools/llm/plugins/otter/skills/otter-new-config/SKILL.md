---
name: otter-new-config
description: This skill should be used when the user asks to "add configuration to a component", "introduce a config flag", "add a feature toggle", "add a runtime config", "create a config property", or when any new configuration flag is being introduced in an Otter workspace. Guides scope decisions, safe defaults, and absence-detection patterns.
---

# Otter New Config

When introducing new config flags (feature toggles, URLs, enums, numeric thresholds) in an Otter workspace, follow this decision process to ensure safe defaults and correct scoping.

## When to Use

- Adding runtime configuration to a component
- Introducing new config flags (feature toggles, URLs, enums, thresholds)
- Deciding whether a config belongs at component or app level
- Determining CMS exposure for a config property

## Scope Decision

```
Who consumes this config?
├── Multiple libraries/packages → GLOBAL (app-level runtime config)
├── Single component only → COMPONENT-LEVEL config
└── App-wide behavior toggle → GLOBAL (app-level runtime config)
```

Explicitly state the scope decision and rationale, then **ask the user to confirm** before proceeding with implementation.

## Implementation

For **component-level** config, use the `@o3r/configuration:add-config` schematic to add configuration to an existing component:

```shell
ng g @o3r/configuration:add-config --path="/path/to/the/component/class.ts"
```

Options:
- `--useSignal` — use a config signal instead of observable
- `--exposeComponent` — expose the component in CMS metadata (default: `true`)

This generates the `*-config.ts` file, wires up the `ConfigurationObserver` (or signal), and registers the component with the configuration service. Do **not** create these files manually.

For **global** (app-level) config, add properties to the existing `AppRuntimeConfiguration` interface — no schematic needed.

## Safe-Default Discipline

Every new config flag **must** have a safe default that preserves current behavior when not explicitly set.

| Type | Default Rule | Naming Convention |
|------|-------------|-------------------|
| Feature toggle | `false` (feature OFF) | `enableX`, `showX`, `allowX` |
| URL/endpoint | `''` (empty string) | Suffixed with `Url` |
| Enum/mode | Value that matches the component's current behavior (introducing the config alone must not change what the user sees) | Suffixed with `Mode` |
| Numeric threshold | Existing value or safe boundary | Descriptive noun |
| Label/text | Use CMS/i18n, NOT runtime config | n/a |

**Critical rules:**

- Feature toggles ALWAYS default to `false` — users opt IN, never opt OUT
- URLs default to `''` — feature is absent when URL is empty
- Enums default to the value that matches the component's current behavior
- A missing config value must never activate new behavior

**Rationale:** Deployments that haven't configured the new flag must continue working exactly as before. A missing config value must never activate new behavior.

## Config-Absence-as-Feature-Detection Pattern

When a config property holds a URL or integration endpoint, its absence signals the feature is unavailable. The check must happen **before** any HTTP call, template rendering, or side effect related to the feature.

```typescript
const hasFeature = !!config.targetUrl?.trim();

if (hasFeature) {
  // safe to call the endpoint / show feature UI
} else {
  // feature does not exist in this deployment — hide entirely
}
```

Rules:

- Every URL-type config must implement this pattern
- Empty string = feature not available (not "feature broken")
- The absence check must guard all usages: HTTP calls, UI elements, and subscriptions
- UI must gracefully handle absence (hide element entirely or show a meaningful fallback)
- Never show broken/empty UI when config is absent (no empty cards, no loading spinners for something that won't load)
- Never call an HTTP endpoint with an empty URL — guard with the absence check first

## Config Naming Conventions

- Global toggles: descriptive verb phrases (`enableX`, `showX`, `allowX`)
- URLs: suffixed with `Url` (`serviceUrl`, `apiBaseUrl`)
- Enums: suffixed with `Mode` (`displayMode`, `validationMode`)
- No abbreviations — full readable names
- camelCase for TypeScript config properties

## Validation Checklist

After introducing a config flag, verify:

- [ ] Config flags have safe defaults
- [ ] Config scope matches consumer analysis
- [ ] URL-type configs implement absence-detection pattern
- [ ] Naming conventions are followed

## Stop Rules

Halt and ask for clarification if:

- A config default would activate new behavior when not explicitly set
- A feature toggle defaults to `true`
- A URL-type config does not implement the absence-detection pattern
