import {
  inject,
} from '@angular/core';
import {
  type CanActivateChildFn,
  type CanActivateFn,
} from '@angular/router';
import {
  NavigationBlockStateConsumerService,
} from '../block-state/navigation-block-state-consumer.service';
import {
  NavigationBlockConfirmationService,
} from '../navigation-confirmation/navigation-block-confirmation.service';
import {
  NavigationRequestManagerService,
} from '../navigation-request/navigation-request-manager.service';

/**
 * Shell application guard intercepting shell-initiated navigation (sidebar clicks, URL bar, programmatic `router.navigate`)
 * when the last state received from a module is `blocked`.
 *
 * Can be used as both `canActivate` and `canActivateChild` to ensure the guard runs when entering a route directly
 * or navigating to its children.
 *
 * Flow:
 * - No state received, or `blocked === false` → navigation proceeds.
 * - `blocked === true` → open the confirmation modal.
 *   - On cancel/dismiss → return `false`, state is untouched, no message sent to the module.
 *   - On confirm → clear the shell mirror, send a `navigation-request` to the originating module (so it can run its unblock /
 *     future draft-persistence logic), await its `navigation-decision`, then return `true`.
 */
export const navigationBlockShellGuard: CanActivateFn & CanActivateChildFn = async () => {
  const consumer = inject(NavigationBlockStateConsumerService);
  const confirmation = inject(NavigationBlockConfirmationService);
  const negotiation = inject(NavigationRequestManagerService);
  const state = consumer.blockState();
  if (!state?.blocked) {
    return true;
  }
  const confirmed = await confirmation.confirm(state.reason);
  if (!confirmed) {
    return false;
  }
  consumer.clear();
  if (!state.channelId) {
    return true;
  }
  return negotiation.requestNavigation(state.channelId, state.reason);
};
