# Navigation Exit

Producer / consumer / guard toolkit to negotiate navigation when an embedded
module holds unsaved work. Both sides — shell and module — speak the same
three message types and share the same Angular services. The confirmation UI
is owned by the shell; modules never decide for the user.

## Mechanism

The shell is the only side that can refuse a navigation; modules participate
to surface their state and to run any cleanup the shell asks for before the
navigation proceeds. Two flows drive the design:

- **Shell-initiated** (sidebar click, URL bar, programmatic
  `router.navigate`) — the shell guard reads its mirror of the module's
  block state, opens the confirmation locally, and on confirm tells the
  originating module to clean up before the navigation happens.
- **Module-initiated** (in-iframe link, in-module `router.navigate`) — the
  module guard sees its own state is `blocked` and asks the shell to open
  confirmation; the shell replies with the user's decision.

Both flows share the same request/decision round-trip, so a single pair of
services covers both directions and there is no shell-only or module-only
negotiation code.

## Message contract

Three versioned messages defined under `messages/navigation-exit/`:

| Type                     | Direction                | Payload                                       | Used for                                                                 |
| ------------------------ | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------ |
| `navigation-block-state` | module → shell           | `{ blocked: boolean, reason?: string }`       | Eager state sync — shell mirror read by the shell guard.                 |
| `navigation-request`     | bidirectional            | `{ correlationId: string, reason?: string }`  | Ask the peer to handle the navigation (open confirmation / cleanup).     |
| `navigation-decision`    | bidirectional            | `{ correlationId: string, proceed: boolean }` | Reply to a `navigation-request`.                                         |

`navigation-request` / `navigation-decision` form a symmetric round-trip
used in both directions — each side registers its own handler under
`NAVIGATION_REQUEST_HANDLER` and the consumer/producer services do the rest.

## Public types

| Type                            | Description                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NavigationBlockState`          | `{ blocked: boolean, reason?: string }` — the module's writable state.                               |
| `ObservedNavigationBlockState`  | Extends `NavigationBlockState` with `channelId?: string`. Used by the shell to track source module.  |
| `NavigationBlockConfirmation`   | Strategy interface: `confirm(reason?: string): Promise<boolean>`.                                    |
| `NavigationRequestHandler`      | Side-specific handler interface: `handle(context): Promise<void> | void`.                            |

## Services and tokens

Same code on both sides — the side-specific behavior is wired through the
two injection tokens.

| Symbol                                    | Role                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NavigationBlockService`                  | Module's writable block state (signal of `NavigationBlockState`). Feature code calls `block(reason?)` / `unblock()`.               |
| `NavigationBlockStateProducerService`     | Module-side: watches the signal and broadcasts `navigation-block-state` on every change.                                          |
| `NavigationBlockStateConsumerService`     | Shell-side: stores the last `navigation-block-state` as `ObservedNavigationBlockState` (with `channelId`) for the shell guard.    |
| `NavigationRequestManagerService`         | Bidirectional producer. `requestNavigation(target?, reason?) → Promise<boolean>`. Coalesces re-entrant guard calls.               |
| `NavigationRequestConsumerService`        | Bidirectional consumer. Receives `navigation-request`, invokes the side-specific handler, sends `navigation-decision` back.       |
| `NavigationDecisionConsumerService`       | Bidirectional consumer. Receives `navigation-decision` and resolves the awaiting producer promise.                                |
| `NAVIGATION_REQUEST_HANDLER`              | Token for the side-specific handler. Defaults to the module handler (`state.unblock()`); shell apps override.                     |
| `NavigationBlockConfirmationService`      | Orchestrates confirmation by delegating to the strategy. Deduplicates concurrent calls.                                           |
| `NAVIGATION_BLOCK_CONFIRMATION`           | Token for the confirmation strategy. Defaults to `BrowserConfirmationStrategy` via tree-shakable factory.                         |
| `BrowserConfirmationStrategy`             | Default strategy backed by `window.confirm()`. Zero dependencies.                                                                 |
| `navigationBlockShellGuard`               | Shell `CanActivateFn` & `CanActivateChildFn`. Opens confirmation locally; on confirm sends a request to the module.               |
| `navigationBlockModuleGuard`              | Module `CanDeactivateFn`. Sends a request to the shell and awaits the user's answer.                                              |
| `provideNavigationRequestShellHandler()`  | Provider that overrides the handler to the shell version (open confirmation, clear mirror, throw on cancel).                      |
| `provideNavigationRequestModuleHandler()` | Provider that re-binds the module handler (`state.unblock()`). Not normally needed — the token already defaults to it.            |
| `provideDefaultNavigationBlockConfirmation()` | Convenience provider re-binding the confirmation token to `BrowserConfirmationStrategy`. Usually unnecessary (it's the default). |

## Confirmation strategies

The confirmation UI is pluggable. Apps either accept the default (browser
`confirm()`) or supply their own strategy class.

| Strategy                                  | Use case                                          | Dependencies |
| ----------------------------------------- | ------------------------------------------------- | ------------ |
| `BrowserConfirmationStrategy` (default)   | Tests, lightweight apps, sample modules           | None         |
| Custom (implements `NavigationBlockConfirmation`) | Modal-based UX, toast, in-app prompt        | App-owned    |

```typescript
// Default — no provider needed, the token's factory wires it.

// Override with a custom strategy
providers: [
  { provide: NAVIGATION_BLOCK_CONFIRMATION, useClass: MyModalStrategy }
]
```

Modal strategies stay in the consuming app — this package contains no UI
framework dependencies.

## Module-side integration

1. Toggle the block state from feature code.

   ```typescript
   import { NavigationBlockService } from '@ama-mfe/ng-utils';

   const store = inject(NavigationBlockService);

   // form becomes dirty
   store.block('Unsaved order changes');

   // form saved or reset
   store.unblock();
   ```

   `NavigationBlockStateProducerService` watches the signal and broadcasts
   `navigation-block-state` on every change.

2. Register `navigationBlockModuleGuard` as `canDeactivate` only on the
   pages that can actually hold unsaved work. Each guarded route needs
   `runGuardsAndResolvers: 'always'` so the guard fires on every
   navigation attempt.

   ```typescript
   import { navigationBlockModuleGuard } from '@ama-mfe/ng-utils';

   export const routes: Routes = [
     { path: 'list', loadComponent: () => import('./list.component').then((m) => m.ListComponent) },
     {
       path: 'orders/:id/edit',
       loadComponent: () => import('./edit-order.component').then((m) => m.EditOrderComponent),
       canDeactivate: [navigationBlockModuleGuard],
       runGuardsAndResolvers: 'always'
     }
   ];
   ```

3. The default `NAVIGATION_REQUEST_HANDLER` is already the module handler,
   so no provider call is required. Eagerly instantiate the producers and
   round-trip consumers at boot so they register with the message bus
   before the first navigation:

   ```typescript
   import {
     NavigationBlockStateProducerService,
     NavigationDecisionConsumerService,
     NavigationRequestConsumerService,
   } from '@ama-mfe/ng-utils';

   // In main.ts after bootstrap (or in a root component constructor)
   inject(NavigationBlockStateProducerService);
   inject(NavigationRequestConsumerService).start();
   inject(NavigationDecisionConsumerService).start();
   ```

## Shell-side integration

1. Override the request handler with the shell version, and (optionally)
   override the confirmation strategy.

   ```typescript
   import {
     NAVIGATION_BLOCK_CONFIRMATION,
     provideNavigationRequestShellHandler,
   } from '@ama-mfe/ng-utils';
   import { ModalConfirmationStrategy } from './navigation-block/modal-confirmation.strategy';

   providers: [
     provideNavigationRequestShellHandler(),
     { provide: NAVIGATION_BLOCK_CONFIRMATION, useClass: ModalConfirmationStrategy }
   ]
   ```

2. Register `navigationBlockShellGuard` on the routes that should be
   intercepted (typically `**`, the home route, and dynamic module routes).

   ```typescript
   import { navigationBlockShellGuard } from '@ama-mfe/ng-utils';

   export const routes: Routes = [
     {
       path: 'home',
       loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
       canActivate: [navigationBlockShellGuard]
     },
     {
       path: ':moduleId',
       canActivateChild: [navigationBlockShellGuard],
       runGuardsAndResolvers: 'paramsOrQueryParamsChange',
       // ...
     }
   ];
   ```

3. Eagerly instantiate the round-trip consumers and the state mirror at
   boot:

   ```typescript
   import {
     NavigationBlockStateConsumerService,
     NavigationDecisionConsumerService,
     NavigationRequestConsumerService,
   } from '@ama-mfe/ng-utils';

   inject(NavigationBlockStateConsumerService).start();
   inject(NavigationRequestConsumerService).start();
   inject(NavigationDecisionConsumerService).start();
   ```

## Flows

### Shell-initiated navigation (sidebar / URL bar)

1. Shell router runs `navigationBlockShellGuard`.
2. If the mirror is empty or `blocked: false` → proceed immediately.
3. Otherwise the guard opens the confirmation locally.
   - **User cancels** → guard returns `false`; nothing is sent to the
     module; the user stays on the current page with their unsaved work.
   - **User confirms** → guard clears the shell mirror and sends a
     `navigation-request` to the originating module, then awaits the
     reply. The module's handler runs `state.unblock()` (and any future
     draft-persistence work), then sends `navigation-decision { proceed: true }`.
     Guard returns `true` and the navigation proceeds.

### Module-initiated navigation (in-iframe link)

1. Module router runs `navigationBlockModuleGuard` as `canDeactivate`.
2. Local state `blocked: false` → proceed immediately.
3. Otherwise the guard broadcasts a `navigation-request` to the shell.
4. Shell's handler opens the confirmation.
   - **User cancels** → handler throws; the consumer sends
     `navigation-decision { proceed: false }`, the module's pending
     promise resolves to `false`, the guard returns `false` and the
     iframe navigation is blocked.
   - **User confirms** → handler clears the shell mirror, the consumer
     sends `navigation-decision { proceed: true }`. Module guard calls
     `state.unblock()` and returns `true`.

## Concurrency & no-response behavior

- **Single-flight requests** — `NavigationRequestManagerService` keeps one
  pending negotiation. Re-entrant guard calls (the same navigation firing
  both `canActivate` and `canActivateChild`, or re-runs from
  `runGuardsAndResolvers: 'always'`) await the same round-trip rather
  than emitting duplicate `navigation-request` messages.
- **Confirmation deduplication** — `NavigationBlockConfirmationService`
  returns the in-flight confirmation promise when `confirm()` is called
  while another confirmation is open, so the user never sees two prompts
  for one navigation.
- **No reply** — if the peer never replies the local promise stays
  pending and the guard holds the navigation. The user remains on the
  current page rather than seeing a navigation that visibly does nothing.
  When the producer is destroyed (e.g. the iframe is torn down) it
  resolves any pending promise to `false`.
