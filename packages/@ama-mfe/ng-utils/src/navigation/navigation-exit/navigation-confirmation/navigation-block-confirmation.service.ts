import {
  inject,
  Injectable,
} from '@angular/core';
import {
  NAVIGATION_BLOCK_CONFIRMATION,
} from './navigation-block-confirmation.interface';

/**
 * Orchestrates navigation block confirmation by delegating to a pluggable strategy.
 * Handles concurrent call deduplication to prevent duplicate confirmations when guards run multiple times.
 *
 * The confirmation UI is read from the `NAVIGATION_BLOCK_CONFIRMATION` token, which defaults to {@link BrowserConfirmationStrategy}
 * (no setup required). Apps with a styled modal override the token via `provideNavigationConfig({ confirmationStrategy })`
 * or by binding the token directly.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationBlockConfirmationService {
  private readonly strategy = inject(NAVIGATION_BLOCK_CONFIRMATION);
  private pendingConfirmation?: Promise<boolean>;

  /**
   * Show confirmation and await user decision. Concurrent calls return the same promise to prevent duplicate confirmations.
   * @param reason Optional reason displayed in the confirmation UI
   * @returns `true` when the user confirms, `false` when they cancel
   */
  public confirm(reason?: string): Promise<boolean> {
    // Deduplication: if confirmation already in progress, return same promise
    if (this.pendingConfirmation) {
      return this.pendingConfirmation;
    }

    // Delegate to injected strategy. Clear the slot only once the promise
    // settles, so concurrent callers in the meantime get the same promise.
    const pending = this.strategy.confirm(reason).finally(() => {
      this.pendingConfirmation = undefined;
    });
    this.pendingConfirmation = pending;
    return pending;
  }
}
