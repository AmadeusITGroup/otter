---
name: logic-state-layer
description: Decision tree for whether a piece of logic belongs in the component class, an injectable service, or an NgRx store, including the scope of the service and where API and SDK calls go. Invoked by the `logic-placement` and `logic-review` skills, which own the surrounding workflow — it is not meant to answer a user question on its own.
---

# Decision tree — logic layer

Returns: **component class**, **service** (and its scope), or **store**.

Walk down and stop at the first match, except where a step tells you to read the next one before concluding. Each step down costs indirection, so earn it.

## Step — component-local: does this state die with the component?

```
TRIGGER  the state is scoped to one component and read by nothing else
         local signals, derived values, event handlers, a form this component owns

RESULT   component class
IMPLEMENT  signal(), computed(), local form wiring — add no service for this
VERIFY     nothing outside the component reads it
           no service or store was created for it

STOP. The layer is decided.
```

```typescript
// Search term and pagination are pure UI concerns: nothing outside this
// component reads them, so they need no service and no store.
public readonly searchTerm = signal('');
public readonly currentPage = signal(1);

public readonly displayedItems = computed(() =>
  this.items().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize())
);
```

## Step — shared or stateless: is it reused beyond one component?

```
CRITERION A  behaviour or state shared between components
CRITERION B  stateless and reusable regardless of sharing — a wrapper over a browser
             API, a pure computation, a cross-cutting concern such as logging
CRITERION C  orchestration across several API calls, or reusable pre/post processing

IF none is true -> go to the application-scoped step

IF any is true  -> a service covers it, but a store criterion can still apply on top.
                   Read the application-scoped step before concluding:
                     none of its criteria met -> RESULT: injectable service
                     any of its criteria met  -> RESULT: store for the state, plus a
                                                 service only for what B or C describes

CHOOSE THE SCOPE (service only)
  shared only between a container and its own subcomponents
    -> providers: [] on that container
  shared across unrelated features, and no store criterion applied
    -> providedIn: 'root'

VERIFY  the container injects it; a presenter does not, unless it is a pure
        presentation helper
        it does not select from the store — that selection belongs in the container

STOP once the application-scoped step has been read and returned no store.
```

```typescript
// Shared between several components, but never persisted and never fetched.
// A store here would add six files for no benefit.
@Injectable({ providedIn: 'root' })
export class InPageNavService {
  private readonly navLinks = signal<NavLink[]>([]);

  /** Links currently registered on the page */
  public readonly links = this.navLinks.asReadonly();

  /** Register the set of links discovered in the page */
  public initialize(links: NavLink[]) {
    this.navLinks.set(links);
  }
}
```

**Prefer a service whenever sharing is the only requirement.** Sharing on its own is the weakest reason to introduce a store, yet it is the most common one given: state is needed in two places, so it goes to the store. A service covers that case at a fraction of the cost — rule it out explicitly before continuing.

**Prefer a component-scoped provider to a root one.** A root singleton outlives the screen, which is a store-like property you probably did not intend. If the lifetime is unclear, see the **shared state lifetime** stop-and-ask in `logic-placement`.

## Step — application-scoped: does it belong to the whole app?

```
CRITERION A  multiple unrelated features read or write it
CRITERION B  it must survive navigation, or be persisted and rehydrated through
             @o3r/store-sync
CRITERION C  it needs async lifecycle tracking: pending, failure, cancellation,
             concurrent request ids
CRITERION D  Otter machinery reads it from the store — configuration, localization,
             rules engine, dynamic content, forms, and analytics all do

IF any is true  -> RESULT: NgRx store. Continue to logic-store-type
ELSE            -> go back to the shared-or-stateless step and use a service

VERIFY  the container injects Store and dispatches; @ngrx/store is never imported
        by a presenter
```

Cost of a store: state, actions, reducer, selectors, sync serializer, an effect if async, plus specs. That is the price of the guarantees above. Two sibling components exchanging a value do not need it.

When criterion D applies because Otter machinery already exposes the data, do not add a second store beside it — that creates a competing source of truth. Redirect to the owning skill, per the out-of-scope table in `logic-placement`.

## Important Otter conventions

- **`@ngrx/store` belongs to containers only.** It should never be imported by a `presenter`. Containers inject `Store` and dispatch directly.
- **Component-scoped services before root ones.** State shared only between a container and its own subcomponents belongs in a service listed in that container's `providers: []`, not `providedIn: 'root'`.

## Where API and SDK calls go

A remote call does not by itself require a store. Decide by what happens to the result:

| Situation | Placement |
|---|---|
| Result local to one screen, discarded on leave | Inject the SDK client, hold the result in signals or observables |
| Several calls to coordinate, or reusable pre/post processing | Service, then rerun this tree for the result |
| Result read by other features, or it must survive navigation or a reload | Store, with the call dispatched into an effect |

Wherever the call ends up, **never issue it from a reducer**.

An unsplit component may inject an SDK client directly when the result is scoped to one screen and shared with nobody:

```typescript
export class PetSearch {
  private readonly petApi = inject(PetApi);

  public readonly pets = signal<Pet[]>([]);
  public readonly isLoading = signal(true);

  /** Reload the list from the API */
  public async reload() {
    this.isLoading.set(true);
    try {
      this.pets.set(await this.petApi.findPetsByStatus({ status: 'available' }));
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

The moment a second feature needs this list, or it must survive navigation, it moves to an async store and these local flags give way to `AsyncStoreItem` — see `logic-store-type`. If the state stays screen-local but needs pending and failure tracking, that is a trade-off for the user: the **local status tracking** stop-and-ask in `logic-placement`.

## Documentation

- [Store sync](https://github.com/AmadeusITGroup/otter/blob/main/docs/store-sync/STORE_SYNC.md) — persisting a store to local or session storage
