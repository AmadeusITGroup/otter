---
name: rxjs-vs-signals
description: This skill should be used when writing or reviewing reactive code in components, services, or stores — any time a choice is made between using Angular Signals (signal, computed, input, effect) or RxJS Observables (subscribe, pipe, switchMap, async pipe). Guides the decision with Otter-specific patterns.
---

# RxJS vs Angular Signals

When writing reactive code in an Otter workspace, choosing the right primitive — Angular Signals or RxJS Observables — impacts readability, performance, and consistency. Use this decision guide to pick the correct approach for each situation.

## Decision Tree

```
What is the nature of the reactive data?
│
├── Synchronous derived state (template binding, computed values)
│   └── Use SIGNALS (signal, computed, input, model)
│
├── Asynchronous streams (HTTP, WebSocket, timers, multi-value over time)
│   └── Use RxJS OBSERVABLES
│
├── Event coordination (debounce, throttle, switchMap, retry, race)
│   └── Use RxJS OBSERVABLES
│
├── NgRx Store selection
│   └── Use RxJS OBSERVABLES (store.select() returns Observable)
│       └── Bridge with toSignal() ONLY at the component boundary for template binding
│
├── Component inputs / outputs
│   └── Use SIGNALS (input(), output(), model())
│
├── Otter configuration
│   └── Use SIGNALS (configSignal) — preferred for new components
│       └── Observable (ConfigurationObserver) still supported for existing code
│
└── Unsure?
    └── Start with SIGNALS for simple state; escalate to RxJS when you need operators
```

## Signals: When and How

Use Angular Signals when:

- The value is **synchronous** and changes over time (component state, form state, UI flags)
- You need **derived/computed** state from other signals
- The value is consumed **primarily in templates** (signals eliminate the need for `async` pipe)
- You are defining **component inputs** (`input()`, `input.required()`)
- You are working with **Otter configuration** in new components (`configSignal()`)

### Signal Patterns

```typescript
// Simple writable state
protected readonly isExpanded = signal(false);

// Computed derived state
protected readonly displayLabel = computed(() =>
  this.isExpanded() ? this.fullLabel() : this.shortLabel()
);

// Component input
public readonly title = input.required<string>();

// Otter configuration (preferred for new components)
public readonly config = input<Partial<MyConfig>>();
@O3rConfig()
public readonly configSignal = configSignal(this.config, MY_CONFIG_ID, MY_DEFAULT_CONFIG);
```

## RxJS Observables: When and How

Use RxJS Observables when:

- The data is **asynchronous** (HTTP calls, WebSocket messages, timers)
- You need **stream composition operators** (switchMap, mergeMap, combineLatest, debounceTime, retry)
- You are working with **NgRx Store** (selectors return Observables)
- You need **cancellation semantics** (unsubscribe, takeUntil, switchMap cancellation)
- You are implementing **Otter rules-engine facts** (facts expose `value$` as Observable)
- You need **error channels** or **completion semantics**
- You are coordinating **multiple async sources** with timing dependencies

### Observable Patterns

```typescript
// NgRx store selection
public readonly items$ = this.store.pipe(select(selectItems));

// HTTP with operators
public readonly searchResults$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) => this.searchService.search(term))
);

// Rules engine fact
public readonly userSelection$: Observable<UserSelection> = this.store.pipe(
  select(selectUserSelection),
  filter((store) => !!store.userSelection),
  map((store) => store.userSelection)
);
```

## Bridging: toSignal() and toObservable()

Use bridge utilities **at boundaries**, not deep in logic chains.

| Bridge | Direction | Use When |
|--------|-----------|----------|
| `toSignal()` | Observable → Signal | You have an Observable but need it in template without `async` pipe |
| `toObservable()` | Signal → Observable | You have a Signal but need to compose it with RxJS operators |

### Rules for Bridging

- **Do** use `toSignal()` at the component level to expose store data to the template
- **Do** provide `initialValue` or use `requireSync` when calling `toSignal()` to avoid `undefined`
- **Don't** chain `toSignal(toObservable(signal).pipe(...))` — use `computed()` if the transformation is synchronous
- **Don't** convert Observables to Signals deep inside services; keep the Observable chain intact and convert only at the consumer boundary
- **Don't** use `toObservable()` just to use `.subscribe()` — use `effect()` instead for side effects on signal changes

### Bridging Examples

```typescript
// Good: toSignal at component boundary for template use
public readonly currentLanguage = toSignal(
  this.localizationService.currentLanguage$,
  { initialValue: this.localizationService.defaultLanguage }
);

// Good: config signal bridges internally, exposes config$ for backward compatibility
public readonly config$ = toObservable(this.configSignal);

// Bad: unnecessary round-trip
// const doubled = toSignal(toObservable(count).pipe(map(x => x * 2)));
// Good: use computed instead
protected readonly doubled = computed(() => this.count() * 2);
```

## Otter-Specific Guidance

| Otter Feature | Recommended Primitive | Rationale |
|---------------|----------------------|-----------|
| Component configuration (new) | `configSignal()` | Signal-based, template-friendly, schematic support via `--useSignal` |
| Component configuration (existing) | `ConfigurationObserver` + `config$` | No need to migrate working code; use `use-config-signal` schematic if migrating |
| Rules engine facts | Observable (`value$`) | Facts are streams that trigger re-evaluation |
| Store interactions | Observable (selectors) | NgRx is Observable-based; bridge with `toSignal()` in components |
| Component inputs | `input()` / `input.required()` | Angular signal inputs are the standard |
| Template bindings | Signal or `async` pipe | Signals preferred for new code (no pipe needed) |
| Localization (current language) | `toSignal()` from service Observable | Service exposes Observable; component bridges for template |

## Migration Guidance

When migrating existing Observable-based code to Signals:

1. **Don't migrate for the sake of migrating** — only convert when there is a clear benefit (simpler code, fewer subscriptions, better template performance)
2. **Use schematics when available** — e.g., `ng g @o3r/configuration:use-config-signal --path=<component>` for configuration migration
3. **Migrate leaf components first** — components with no downstream Observable consumers are safest to convert
4. **Keep `config$` as backward-compatible bridge (only if needed)** — when migrating config to signal and downstream consumers still rely on Observables, expose `config$ = toObservable(this.configSignal)` to maintain backward compatibility; otherwise, remove the Observable entirely
5. **Avoid mixing reactive models in the same data flow** — don't read signals inside RxJS `pipe()` chains (the pipeline won't re-trigger on signal changes) and don't `subscribe()` just to feed a signal (use `toSignal()` instead)

## Anti-Patterns (Hard Rules)

- Using `signal()` for async data that requires error handling (use Observable + catchError)
- Using `effect()` as a replacement for RxJS operators (effect is for side effects, not data transformation)
- Subscribing to an Observable in a component just to set a signal (use `toSignal()` instead)
- Wrapping every Observable in `toSignal()` at service level (convert at the consumer boundary)
- Using `async` pipe AND `toSignal()` for the same data in one component (pick one approach per data source)
- Creating new `ConfigurationObserver` when `configSignal()` is available (prefer signals for new components)

## Stop Rules

Halt and ask for clarification if:

- The use case involves complex multi-stream coordination AND simple template binding (may need both primitives with clear boundary)
- Existing code uses `ConfigurationObserver` and the user hasn't indicated whether migration is desired
- The data flow spans multiple services and converting one layer would force cascading changes
