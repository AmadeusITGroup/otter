---
name: logic-review
description: Review existing components, services, or stores for misplaced logic — presenter leaks, componentType mismatches, wrong store variants.
  Use `logic-placement` when designing something new.
---

# Logic review — review mode

Assess code that already exists against the same trees the design side uses, so a review can never contradict a design recommendation.

To decide where something new should go, use `logic-placement`.

## Procedure

Read in this order, and read the tree before judging its dimension — do not judge from memory.

| # | Look at | Read | Judge |
|---|---|---|---|
| 1 | Component classes, decorators, templates | `logic-component-shape` | is the split, or its absence, justified; does `componentType` match the role |
| 2 | What each class injects and holds | `logic-state-layer` | is the layer the shallowest one that works; are API calls in the right place |
| 3 | Store files, if any | `logic-store-type` | does the variant match the data |

Rules for the whole pass:

- **Judge a split by what varies, not by whether it exists.** A missing split is a finding only when one of the variation criteria is met.
  An existing split whose container only forwards inputs is a finding regardless.
- **Do not recommend a store type migration inside the change under review.** See the **store type migration** stop-and-ask in `logic-placement`.

## Check — presenter purity

The test: **can the presenter be rendered from a spec by supplying inputs only?** If it needs a store or an HTTP mock, logic has leaked.

Follow the injections one level deeper than the imports.
A presenter that injects no store and calls no HTTP client can still reach both through a service, which hides the dependency without removing it.

```
FOR each service a presenter injects:
  does it select from the store, call an API, or trigger a side effect
  beyond the component?
    yes -> FINDING: the dependency belongs in the container
    no  -> allowed, if it is a presentation helper such as formatting or breakpoints
```

## Check — componentType against the actual role

A mismatch between `@O3rComponent({ componentType })` and what the class does is a reliable signal that logic sits in the wrong place.
Either the type or the logic must move — decide which from the responsibility table in `logic-component-shape`.

| Symptom | Reading |
|---|---|
| `Page` or `Block` that injects nothing and only holds display state | it is really a presenter |
| `Component` or `ExposedComponent` that dispatches store actions | it is really a container |
| `-pres` suffix on a class that fetches its own data | the suffix or the fetch is wrong |

## Anti-patterns

### Components

| Symptom | Why it is wrong | Fix |
|---|---|---|
| Presenter injecting `Store`, dispatching, or fetching — including indirectly through a service that does | the presenter can no longer be rendered from inputs, so it cannot be reused or CMS-replaced | move the dependency to the container, pass the result down as an input |
| Container with a `.scss` file, or doing display formatting | display concerns on the data side of the seam, so the presenter is no longer swappable | move styling and formatting into the presenter |
| Container that only forwards its inputs | indirection with no seam to absorb variation | collapse it back into a single component |
| Business logic in template bindings | components run `ChangeDetectionStrategy.OnPush`; the expression re-evaluates and the intent is untestable | derive in `computed()`, or in the container |
| `componentType` disagreeing with the class's role | CMS metadata extraction reflects the wrong shape | see the componentType check above |
| Naming drift between file, class, selector, template, and spec | the `-cont` / `-pres` convention is what makes the roles legible | realign all five, or regenerate |

### Stores and services

| Symptom | Why it is wrong | Fix |
|---|---|---|
| A store created to pass data between two components | six files and a serializer for a guarantee nobody needed | a service — see the shared-or-stateless step in `logic-state-layer` |
| API call inside a reducer | reducers must be pure; the call is untestable and re-runs on replay | move it into an effect |
| `.subscribe()` in a container followed by a dispatch | the subscription is unmanaged and the sequencing is implicit | move it into an effect |
| Hand-rolled `isLoading` or `hasError` beside an async store | duplicates `AsyncStoreItem`, and the copies drift | read the status off the state |
| Simple store holding records updated one at a time | no per-item status, and updates rewrite the whole model | entity store. An array of primitives is fine in a simple store |
| Sync store whose data actually comes from an API | no pending, failure, or cancellation handling exists to hook into | async variant |
| Root service holding state that should die with the screen | a root singleton outlives the screen, which is a store-like property | move to the container's `providers: []` |
| Hand-written store files | naming, adapter, selectors, and sync serializer drift from convention | regenerate with `ng g store*` |

## Reporting findings

One block per finding, most severe first.

```
FINDING   <one sentence: what is misplaced>
  where   <file>:<line>
  rule    <which check or anti-pattern, and which skill states it>
  impact  <what breaks or degrades — reuse, testability, CMS replacement, correctness>
  fix     <the concrete move, naming the target layer or component>
```

Close with a verdict on the checklist below rather than restating it item by item.

## Checklist

- [ ] Split justified by flavours, reuse, or CMS replacement — not by habit
- [ ] Presenter renderable from inputs alone: no store, no SDK client, no router, directly or through a service
- [ ] Container holds no styling and no display formatting
- [ ] `componentType` agrees with the class's actual role
- [ ] Layer is the shallowest that works: component class before service, service before store
- [ ] Store justified by cross-feature sharing, persistence, async tracking, or Otter machinery
- [ ] Store variant matches the data: collection versus singleton, remote-fed versus locally controlled
- [ ] API calls sit in an effect or a service, never in a reducer
- [ ] Naming conventions intact across file, class, selector, template, and spec

## Documentation

- [Container / Presenter](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/CONTAINER_PRESENTER.md) —
  the source for the split, the naming conventions, and the folder layout a finding can cite
- [Component introduction](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/INTRODUCTION.md) — the `@O3rComponent` decorator and the meaning of each `componentType`
- [Store sync](https://github.com/AmadeusITGroup/otter/blob/main/docs/store-sync/STORE_SYNC.md) — what persisting a store requires, when a finding turns on persistence

## Related skills

- `logic-placement` — the design-mode entry point, and the owner of the stop-and-ask rules
- `logic-component-shape`, `logic-state-layer`, `logic-store-type` — the three decision trees
- `rxjs-vs-signals` — reviewing the reactive primitive rather than the layer
