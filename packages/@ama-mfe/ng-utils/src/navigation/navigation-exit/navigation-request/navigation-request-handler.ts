import {
  inject,
  InjectionToken,
} from '@angular/core';
import {
  NavigationBlockService,
} from '../block-state/navigation-block.service';

/** Context passed to a {@link NavigationRequestHandler} for each incoming request. */
export interface NavigationRequestContext {
  /** Peer id that sent the request. */
  from: string;
  /** Optional human-readable reason attached to the request. */
  reason?: string;
}

/**
 * Side-specific handler invoked by {@link NavigationRequestConsumerService} whenever a `navigation-request` arrives from a peer.
 *
 * Responsibilities per side:
 * - **Shell application** — open the confirmation modal and await the user's answer. If the user confirms, resolve;
 *   if the user cancels, throw / reject so the consumer skips sending the decision. See {@link createNavigationRequestShellHandler}.
 * - **Module** — run the module's local cleanup (at minimum `state.unblock()`; later: persist drafts) and resolve.
 *   The module cannot refuse — only the shell modal can. See {@link createNavigationRequestHandler} (the default).
 *
 * Exposed as an interface so apps can supply either a function-style implementation (`{ handle: (ctx) => ... }`)
 * or a class instance — useful when the handler needs its own dependencies.
 */
export interface NavigationRequestHandler {
  handle: (context: NavigationRequestContext) => Promise<void> | void;
}

/**
 * Default module-side `navigation-request` handler. Runs the module's local cleanup — at minimum clearing the block state — and resolves.
 * Modules cannot refuse a navigation (only the shell modal can), so this always resolves and a `navigation-decision` is always sent back.
 *
 * Used as the default factory of {@link NAVIGATION_REQUEST_HANDLER}, so a module gets this behavior without any explicit provider.
 * Apps that need to persist drafts before unblocking can override the token with their own handler.
 */
export const createNavigationRequestHandler = (): NavigationRequestHandler => {
  const store = inject(NavigationBlockService);
  return {
    handle: () => {
      store.unblock();
    }
  };
};

/**
 * Injection token for the per-side request handler.
 *
 * **Default behavior (modules):** Clears the block state (unblock) — see {@link createNavigationRequestHandler}.
 * **Shell override:** Opens confirmation modal and awaits user decision.
 *
 * The module handler is provided by default at root level. Only the shell application needs to override it
 * with `provideNavigationRequestShellHandler()`.
 */
export const NAVIGATION_REQUEST_HANDLER = new InjectionToken<NavigationRequestHandler>(
  'NAVIGATION_REQUEST_HANDLER',
  {
    providedIn: 'root',
    factory: createNavigationRequestHandler
  }
);
