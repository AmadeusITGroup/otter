---
name: otter-rules-engine
description: This skill should be used when the user asks to "add a rule", "create a ruleset", "add a fact", "create a custom operator", "add a rules-engine action", "make behavior conditional at runtime", or when authoring or debugging anything in an Otter `@o3r/rules-engine` workspace. Guides the fact/operator/action/ruleset workflow, registration steps, and safe defaults.
---

# Otter Rules Engine

The Otter rules engine (`@o3r/rules-engine`) is a client-side mechanism that evaluates a sorted list of **Rulesets** and applies **actions** based on the application's runtime context. When building or editing rules-engine artifacts, follow the workflow below so facts, operators, actions, and rulesets stay consistent and correctly registered.

## When to Use

- Authoring or editing a Ruleset JSON file
- Adding a custom fact, operator, or action
- Making component behavior conditional at runtime (config, translation, asset, placeholder)
- Debugging why a rule does not trigger

## Concept Map

| Concept | What it is | How to create |
|---------|-----------|---------------|
| **Ruleset** | Sorted list of rules; may be gated by `validityRange` / `linkedComponents` | Hand-authored/generated JSON validated by the ruleset schema |
| **Rule** | Tree of `IF_ELSE` blocks (branches) ending in `ACTION` blocks (leaves), identified by a unique `id` | Inside the Ruleset JSON |
| **Operator** | Pure function evaluating a condition (up to two operands) | `ng g @o3r/rules-engine:operator` |
| **Fact** | A stream of business values (`value$`) that triggers re-evaluation | `ng g @o3r/rules-engine:facts-service` |
| **Action** | Side effect applied at runtime, identified by a unique `actionType` | Built-in, or a custom `RulesEngineActionHandler` |

## Prerequisites

Requires an Otter-based app with `@o3r/rules-engine` installed (`ng add @o3r/rules-engine`) and the runner registered via `provideRulesEngineRunner()` (see below). To enable rules-engine on an existing Otter component, run the schematic rather than wiring it by hand:

```shell
ng g @o3r/rules-engine:rules-engine-to-component --path=<path-to-component-class.ts>
```

## Decision: What Do You Need to Create?

```
What is missing to express the rule?
├── A business value the condition depends on → create a FACT
├── A comparison the built-in operators don't cover → create an OPERATOR
├── A runtime effect not covered by built-ins → create an ACTION handler
└── Only the logic itself → edit the RULESET JSON only
```

Always prefer built-in actions and operators before creating custom ones. Built-in actions:

- `UPDATE_CONFIG` — modify a configurable component's config (`@o3r/configuration`)
- `UPDATE_ASSET` — override an asset path used by `o3rDynamicContent` (`@o3r/dynamic-content`)
- `UPDATE_LOCALISATION` — substitute a translation key (`@o3r/localization`)
- `UPDATE_PLACEHOLDER` — inject HTML into a placeholder (`@o3r/components`)

## Creating a Fact

Generate the fact structure with the schematic — do **not** hand-create the files:

```shell
ng g @o3r/rules-engine:facts-service <name> --path=<path-to-fact-folder>
```

This produces a `FactDefinitions` interface and a service extending `FactsService`. Then implement the logic and follow these rules:

- **Observable facts must end with `distinctUntilChanged()`** to avoid re-evaluating every dependent rule on each emission.
- **Guard lazy state with a `filter`** so the fact registers even before a lazy-loaded store emits.
- **Do NOT pull in the backing store's providers where you register the fact service** (keeps the store lazy-loadable).
- **Register the fact** at bootstrap via the service's `.register()` inside `runInInjectionContext`.
- **Document each fact property with TSDoc** — the extractor uses it for admin-UI metadata.

Performance: a rule re-evaluates whenever an input fact updates. Avoid high-frequency facts (e.g. 1s timers); gate the ruleset with `linkedComponents` when the affected component may be absent.

## Creating an Operator

```shell
ng g @o3r/rules-engine:operator <name> --path=<path-to-operators-folder>
```

- Keep operators **pure** (no side effects, no external state) — the only sanctioned exceptions are the implicit built-in-fact operators like `dateInNextMinutes`.
- Implement `validateLhs` (and `validateRhs` when a right operand exists) so invalid operand types fail fast.
- Register with `rulesEngine.upsertOperators([myOperator])`.
- Add a `@title` TSDoc tag for a human-friendly name in extracted metadata.
- For pattern operators (`matchesPattern`, `oneMatches`, `allMatch`), escape special chars with double backslashes (`\\t`) and prefix a leading `/` with `\\` so it is not wrongly detected as an ES RegExp.

### Time-based operators require the `o3rCurrentTime` built-in fact

Operators like `dateInNextMinutes` depend on the implicit `o3rCurrentTime` fact, backed by `CurrentTimeFactsService`. Although the service ships with the package (`providedIn: 'root'`), it is **not** registered with the engine automatically — you must register it or the whole ruleset fails, exactly like any other unregistered fact. It also does not refresh on its own — call `currentTime.tick()` to recompute the current time on a trigger that fits the app; a common one is each router navigation:

```typescript
const router = inject(Router);
const currentTime = inject(CurrentTimeFactsService);
currentTime.register();
router.events.pipe(
  filter((event) => event instanceof NavigationEnd),
  takeUntilDestroyed()
).subscribe(() => currentTime.tick());
```

Without a `tick()`, time-based conditions never re-evaluate.

## Creating a Custom Action

Only when no built-in action fits. An action handler implements `RulesEngineActionHandler`, declares its ids in `supportingActions`, and runs them in `executeActions`.

- Define a unique `actionType` constant and export it — it is the contract between JSON and code.
- Extend `RulesEngineAction` with a typed payload interface.
- Register the handler at bootstrap: `ruleEngine.registerActionHandlers(inject(MyActionHandler))`.
- **Custom actions break the Otter ruleset schema.** The strict Otter schema rejects unknown actions — you must maintain your own schema for rulesets that use them.

## Authoring a Ruleset

Every Ruleset JSON references the schema and gives every ruleset and rule a **unique `id`**:

```json5
{
  "schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/%40o3r/rules-engine/schemas/rulesets.schema.json",
  "rulesets": [
    {
      "id": "<uuid>",
      "name": "My Ruleset",
      "disabled": false,
      "rules": [ /* ... */ ]
    }
  ]
}
```

Rules:

- **Declare runtime facts explicitly** — a rule's `inputRuntimeFacts` and `outputRuntimeFacts` must list every runtime fact it reads or sets, or re-evaluation optimization breaks.
- Runtime facts are **scoped to their Ruleset** and reset between executions — they cannot cross rulesets.
- An `IF_ELSE` block with no condition always runs its `successElements`.
- If any rule in a ruleset errors, **none** of that ruleset's actions apply (they are treated as linked).
- Gate rulesets that only affect one component with `linkedComponents`; gate time-bound rulesets with `validityRange`.

## Registration Checklist (the #1 source of silent failures)

The engine is agnostic — everything must be explicitly registered or it silently no-ops (or warns). Register at bootstrap through the application config `providers` array, but **only add the action provider for action types your rulesets actually use** — do not register handlers for actions you never emit:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRulesEngineRunner({ debug: !environment.production }),
    // Add ONLY the action providers matching the actions used in your rulesets:
    provideConfigurationRulesEngineAction(),   // only if UPDATE_CONFIG is used
    // provideAssetRulesEngineAction(),        // only if UPDATE_ASSET is used
    // providePlaceholderRulesEngineAction(),  // only if UPDATE_PLACEHOLDER is used (bundles its request/template stores)
    provideRulesEngineDevtools(),              // optional, dev only
  ]
};
```

Then verify:

- [ ] **Action providers registered for the actions in use only** — `provideConfigurationRulesEngineAction()` for `UPDATE_CONFIG`, `provideAssetRulesEngineAction()` for `UPDATE_ASSET`, `providePlaceholderRulesEngineAction()` for `UPDATE_PLACEHOLDER`. For `UPDATE_LOCALISATION` there is no provider function yet — import `LocalizationRulesEngineActionModule` via `importProvidersFrom(LocalizationRulesEngineActionModule)`.
- [ ] **Facts registered** via the fact service `.register()`
- [ ] **Custom operators registered** via `upsertOperators`
- [ ] **Rulesets loaded** into the runner

## Safe-Default Discipline

- A rule must not activate new behavior when its facts are absent/undefined. Provide `failureElements` (or a safe default action value) that preserves current behavior.
- New rulesets should default to `disabled: false` only when their safe path is verified; otherwise ship `disabled: true` and enable deliberately.

## Debugging

Enable debug mode and use the console devtools before assuming a rule is wrong:

```typescript
provideRulesEngineRunner({ debug: true })
```

```typescript
_OTTER_DEVTOOLS_.rulesEngine.getActiveRulesets();
_OTTER_DEVTOOLS_.rulesEngine.getRulesetExecutions(rulesetId);
_OTTER_DEVTOOLS_.rulesEngine.getAllOutputActions();
```

Or install the Otter rules-engine Chrome extension for a visual view. When a rule does not fire, check the Registration Checklist first — an unregistered action raises a warning, and an unregistered fact leaves the ruleset failing until the fact becomes available.

### Symptom → Likely Cause

| Symptom | Likely cause |
|---------|--------------|
| Rule evaluates and its action appears in `getAllOutputActions()`, but nothing changes in the app | The matching action provider is missing — e.g. `UPDATE_CONFIG` emitted but `provideConfigurationRulesEngineAction()` not added. The engine emits the action; with no handler registered it is silently dropped (a console warning is logged in debug mode). |
| Ruleset never activates / stays in a failing state | An input fact is unregistered or has not emitted yet — register it via the fact service `.register()` and guard lazy state with a `filter`. |
| Custom operator throws or the rule is skipped | Operator not registered via `upsertOperators`, or `validateLhs`/`validateRhs` rejecting the operand types. |
| Time-based operator (`dateInNextMinutes`, …) never matches, or its ruleset fails | `CurrentTimeFactsService` not registered (`.register()`), or registered but never `tick()`ed so `o3rCurrentTime` never refreshes. |
| Ruleset absent from `getActiveRulesets()` | Ruleset not loaded into the runner, or gated out by `validityRange` / `linkedComponents`. |

The first row is the most common trap after wiring rulesets: the rule logic is correct and the action is produced, but no visible effect occurs because the action's provider was never added (or was removed as "unused"). Confirm the provider for that action type is in the bootstrap `providers`.

## Metadata Extraction (admin/CMS UIs)

If rules are administered through a UI, extract fact and operator metadata with the builder so the UI knows what is available:

```shell
ng run <project>:extract-rules-engine
```

Configure `factFilePatterns`, `operatorFilePatterns`, and `libraries` in `angular.json`. Fact interface properties and operator `@title`/TSDoc drive the generated metadata, so document them.

## Stop Rules

Halt and ask for clarification if:

- A custom action is requested but a built-in action (`UPDATE_CONFIG`, `UPDATE_ASSET`, `UPDATE_LOCALISATION`, `UPDATE_PLACEHOLDER`) would suffice
- A ruleset uses a custom action but still points at the strict Otter schema
- A fact based on an Observable lacks `distinctUntilChanged()`
- A rule reads/sets a runtime fact not declared in `inputRuntimeFacts` / `outputRuntimeFacts`
- A rule would activate new behavior when its facts are undefined
