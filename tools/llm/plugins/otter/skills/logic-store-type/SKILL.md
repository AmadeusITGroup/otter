---
name: logic-store-type
description: Decision tree for which of the four NgRx store variants to generate — entity or simple, sync or async — and what each one provides. Invoked by the `logic-placement` and `logic-review` skills once a store has been justified; it is not meant to answer a user question on its own, and does not decide whether a store is warranted at all.
---

# Decision tree — store implementation

Returns: one of `store-entity-async`, `store-entity-sync`, `store-simple-async`, `store-simple-sync`.

**Precondition:** a store is already justified by the application-scoped step of `logic-state-layer`. If it is not, stop and go back — a store chosen here for state that only needs sharing is the most expensive mistake in this area.

Answer two questions — **what shape is the state**, and **what fills it** — and read the variant off this table:

| | **Sync**: filled by local code | **Async**: filled by a remote call |
|---|---|---|
| **Simple**: holds one value | `store-simple-sync` | `store-simple-async` |
| **Entity**: holds a keyed collection | `store-entity-sync` | `store-entity-async` |

"Collection" means records that are **individually addressable**: each carries an id and can be updated, removed, or marked pending on its own. An array that is always read and written as a whole counts as one value, so it is simple, not entity.

## Collection shape — entity or simple

```
ASK  are the items individually addressable and independently updatable?

YES -> ENTITY
       a list of bookings, passengers, or search results, where one item can be
       updated, removed, or marked pending on its own
       state extends EntityState<Model> from @ngrx/entity: an adapter, normalized
       ids/entities, generated selectAll/selectEntities/selectIds/selectTotal
       requires an id property (modelIdPropName) — the practical test is that each
       item already carries something that identifies it

NO  -> SIMPLE
       one value, held as a single `model`: the current user session, active search
       criteria, a configuration blob
       also an array always read and written as one unit, such as destination codes.
       There is no meaningful id to key on, and EntityState would force you to invent
       one — holding such an array in a simple store is correct, not a workaround
```

The distinction matters most for async stores, where entity gives each record its own pending and failure status. A list of strings has nothing to track per item, so that machinery buys nothing.

## Data source — sync or async

```
ASK  does a remote call fill this, and does the UI care about pending or failure?

NO  -> SYNC
       state mutated only from code you already have in hand. No effect file is
       generated. Actions are set, update, reset, plus entity variants.
       Choose it for local or derived state, user selections, anything hydrated
       from storage rather than fetched.

YES -> ASYNC
       generates an effect file and mixes AsyncStoreItem into the state, giving
       requestIds, isPending, isFailure on the state itself. Actions gain *FromApi
       variants plus fail* and cancel*Request — two *FromApi actions for simple
       stores, three for entity stores.
       The container dispatches a *FromApi action carrying the SDK call in its
       payload and the effect runs it, which is also what cancels superseded
       requests on the set*FromApi path.
```

## Typical state per variant

Use these to sanity-check the answer the two questions produced.

| | Sync | Async |
|---|---|---|
| **Simple** | Single object under local control. User preferences, active filters, wizard step | Single object fetched once. Session, current itinerary, remote feature flags |
| **Entity** | Collection under local control. Client-side lists, selections, locally built items | Collection fetched from an API. Search results, product catalogue, bookings |

`entity-async` is the most common and the most expensive. It applies `AsyncStoreItem` at *two* levels: per entity, so each item tracks its own pending and failure, and on `StateDetails` for the collection as a whole. Use per-entity status for row-level spinners and the global one for list-level loading.

**Never add your own `isLoading` or `hasError` fields beside an async store.** That state already exists on `AsyncStoreItem`, and the duplicate drifts.

## Generating and registering

```
SCHEMATIC  ng g store-<entity|simple>-<sync|async>
THEN       write provide<Name>Store
           call provideEffects for an async store
           add the store to the root state type
```

Plain `ng g store` prompts for the variant instead of taking it from the name, and `ng g store-action` adds an action to a store that already exists.

If the schematic cannot be run, read its factory and templates and reproduce them by hand rather than guessing the state shape — see `otter-schematics`.

Registration is the one thing the schematics do **not** generate — there is no module or provider template. A generated store that nothing provides fails at runtime, not at compile time.

Getting the type wrong is expensive to undo: it changes the state shape, the selectors, and every consumer. Spend the thought here, and if an existing store has the wrong type for a new requirement, see the **store type migration** stop-and-ask in `logic-placement`.

## Documentation

- [Store sync](https://github.com/AmadeusITGroup/otter/blob/main/docs/store-sync/STORE_SYNC.md) — persisting a store to local or session storage
