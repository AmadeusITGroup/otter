import {
  inject,
} from '@angular/core';
import {
  type CanDeactivateFn,
} from '@angular/router';
import {
  NavigationBlockService,
} from '../block-state/navigation-block.service';
import {
  NavigationRequestManagerService,
} from '../navigation-request/navigation-request-manager.service';

/**
 * Module-side guard intercepting navigation away from a page that holds unsaved changes.
 *
 * - `blocked === false` → navigation proceeds.
 * - `blocked === true` → broadcast a `navigation-request` to the shell and await the reply. The shell opens the confirmation modal
 *   and replies in both cases: `proceed === true` on confirm, `proceed === false` on cancel/dismiss. On proceed, clear the local
 *   state and return `true`; on cancel, return `false` and leave the block state intact so the navigation is held and a later
 *   attempt can negotiate again.
 *
 * Wire it as `canDeactivate` only on the routes that can actually hold unsaved work — modules opt in per page.
 */
export const navigationBlockModuleGuard: CanDeactivateFn<boolean> = async () => {
  const store = inject(NavigationBlockService);
  const negotiation = inject(NavigationRequestManagerService);
  const { blocked, reason } = store.state();
  if (!blocked) {
    return true;
  }
  const proceed = await negotiation.requestNavigation(undefined, reason);
  if (proceed) {
    store.unblock();
  }
  return proceed;
};
