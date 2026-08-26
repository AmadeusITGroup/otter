import {
  Injectable,
} from '@angular/core';
import type {
  NavigationBlockConfirmation,
} from '../navigation-block-confirmation.interface';

/**
 * Default confirmation strategy using browser's native `window.confirm()`.
 * Simple, no dependencies, works in any environment. Suitable for:
 * - Development/testing
 * - Apps without custom modal libraries
 * - `@ama-mfe` packages that need basic confirmation
 *
 * Production apps typically override this with a modal-based strategy.
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserConfirmationStrategy implements NavigationBlockConfirmation {
  /**
   * Show native browser confirmation dialog.
   * @param reason Optional reason displayed in the message
   * @returns Promise<true> if user clicks OK, Promise<false> if user clicks Cancel
   */
  public confirm(reason?: string): Promise<boolean> {
    const message = `${reason ? reason + '\n' : ''}Do you want to leave this page?`;

    // eslint-disable-next-line no-alert -- intentional use of window.confirm for basic confirmation strategy
    return Promise.resolve(window.confirm(message));
  }
}
