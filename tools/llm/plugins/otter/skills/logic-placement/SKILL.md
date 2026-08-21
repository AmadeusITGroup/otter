---
name: logic-placement
description: This skill should be used when the user asks "where should this logic go", "should this be a service or a store", "which store type should I use", "should I split this into container and presenter", "add an API call to a component", "share state between components", or when designing a new component, service, or store in an Angular or Otter workspace. Routes each decision to its dedicated decision tree and returns a placement recommendation. Out of scope, each covered by its own skill — configuration flags, localization, rules engine, forms, analytics, and the choice between signals and observables. Use `logic-review` instead to assess code that already exists.
---

# Logic placement — design mode

Decide where a piece of logic belongs **before** it is written. This skill holds the order of the decisions, the rules for halting, and the output format. The criteria for each decision live in a sub-skill: read it before answering, do not answer from memory.

To assess code that already exists, use `logic-review`.

## Out of scope

Stop and redirect when the question is really about:

| Question | Handled by |
|---|---|
| A configuration flag, feature toggle, or CMS-editable value | `otter-new-config` |
| Behaviour that should be runtime-conditional rather than coded | `otter-rules-engine` |
| Which reactive primitive to express the logic with | `rxjs-vs-signals` |
| How to run the generator once the shape is decided | `otter-schematics` |
| Reimplementing localization, forms, or analytics | the corresponding Otter package, not a new service or store |

Otter machinery already owns state in those areas, so adding a service or store beside it creates a second source of truth. Deciding **which half of a split wires that machinery up** is still in scope — form validators and submit handling belong to the container, per `logic-component-shape`.

## Decision order

| # | Decision | Read | Returns |
|---|---|---|---|
| 1 | Component shape | `logic-component-shape` | single component, or container + presenter |
| 2 | Logic layer | `logic-state-layer` | component class, service, or store |
| 3 | Store implementation | `logic-store-type` | one of the four `ng g store*` variants |

The store implementation decision runs **only** if the logic layer decision returned "store". Never start there: most state that feels store-shaped is service-shaped, and most components that feel split-shaped are not.

## When to settle each decision

| Decision | Settle it | Cost of changing later |
|---|---|---|
| Component shape | Before `ng g component` | Low — rerun the schematic, or add the display half later with `--componentStructure=presenter` |
| Logic layer | Before scaffolding | Low — extract or inline before anything consumes it |
| Store implementation | Before `ng g store*` | **High** — reshapes state, selectors, and every consumer |

Settle shape and layer first, then scaffold immediately to lock the structure in. A store type raised for the first time in PR review is already expensive; it belongs in the design discussion.

## Stop and ask

These situations are trade-offs the user owns. **Stop, ask, and wait** — do not pick for them. Other skills cite these by name, so keep the names stable when adding or removing one.

### Local status tracking

```
TRIGGER  state is local to one screen, but the UI must show pending or failure
ASK      "This state is local to this screen but needs pending/failure tracking.
          A. Async store — you get AsyncStoreItem, but the state is promoted to application scope
          B. Local signals — the scope stays right, but you hand-code isLoading/hasError
          Which fits?"
THEN     A -> the store implementation decision, via logic-store-type
         B -> component class, no store
```

### Shared state lifetime

```
TRIGGER  state is shared, but it is unclear whether it should outlive the screen
ASK      "When this screen closes, should this state:
          A. die with the screen
          B. survive until logout
          C. survive a page reload"
THEN     A -> service in the container's providers: []
         B -> service with providedIn: 'root'
         C -> store, persisted through @o3r/store-sync
```

### Store type migration

```
TRIGGER  a requirement needs entity<->simple or sync<->async to change on an existing store
ACTION   STOP. Do not fold the migration into the current change.
SAY      "This needs <current> to become <target>, which reshapes the state and every
          consumer. That belongs in its own change — confirm before starting."
```

### Split without variation

```
TRIGGER  a container/presenter split is suggested, but none of the three variation
         criteria in logic-component-shape is met
ASK      "I cannot see what would vary between container and presenter here.
          What varies today — not in theory?"
THEN     the user names it -> split
         the user cannot   -> single component
```

### CMS replacement undecided

```
TRIGGER  whether integrators configure or replace the component is unknown, and it
         determines both the split and the componentType value
ASK      "Will integrators configure or replace this component through the CMS?"
THEN     yes -> split, presenter as ExposedComponent
         no  -> single component, or Block for a container
```

## Output format

Report every recommendation in one of these three shapes, and nothing looser.

### Single component

```
RECOMMENDATION  single component <name>
  componentType <Page | Block | Component>
  logic layer   <component class | service | store>
  because       <the criteria that were and were not met>
NEXT STEP       ng g component <name> --componentStructure=simple
VERIFY          no -cont or -pres suffix
                logic sits in the class, a service, or a store — never in template bindings
```

### Container and presenter

```
RECOMMENDATION  <name>-cont + <name>-pres
  container     componentType <Page | Block>, owns <data source / state / dispatch>
  presenter     componentType <ExposedComponent | Component>, owns display
  because       <which of the three variation criteria applies, and what varies>
NEXT STEP       ng g component <name> --componentStructure=full
VERIFY          the presenter renders from inputs alone: no store, no SDK client, no router
                the container carries no .scss and no display formatting
```

### Store

```
RECOMMENDATION  <entity | simple> + <sync | async> store for <name>
  because       <which store criterion is met: cross-feature, persistence, async, machinery>
  shape         <keyed collection | single value>, id property <name> (entity only)
NEXT STEP       ng g store-<entity|simple>-<sync|async>
                then write provide<Name>Store, call provideEffects (async), extend the root state
VERIFY          the container dispatches; presenters never import @ngrx/store
                remote calls sit in an effect, never in a reducer
                no hand-rolled isLoading/hasError beside AsyncStoreItem
```

Run the NEXT STEP through `otter-schematics`. If the schematic fails or does not exist, do not hand-write the files from memory — that skill covers reading the schematic's own templates and reproducing them.

## Related skills

- `logic-review` — the same decision trees applied to code that already exists
- `logic-component-shape`, `logic-state-layer`, `logic-store-type` — the three trees
- `rxjs-vs-signals` — which reactive primitive to express the chosen layer with
- `otter-schematics` — discovering and running the generator named in NEXT STEP
