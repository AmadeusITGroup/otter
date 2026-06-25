import {
  inject,
  InjectionToken,
} from '@angular/core';
import {
  BrowserConfirmationStrategy,
} from './strategies/browser-confirmation.strategy';

/**
 * Strategy interface for confirming navigation when unsaved changes exist.
 * Implementations provide different UI mechanisms (browser confirm, modal, etc.)
 */
export interface NavigationBlockConfirmation {
  /**
   * Show confirmation UI and await user's decision.
   * @param reason Optional human-readable reason for the block (e.g., "Unsaved order changes")
   * @returns Promise<true> if user confirms navigation, Promise<false> if cancelled
   */
  confirm(reason?: string): Promise<boolean>;
}

/**
 * Injection token for the navigation block confirmation strategy.
 * Defaults to {@link BrowserConfirmationStrategy} (uses `window.confirm()`).
 * Apps with a styled modal override the default by passing their own class via `provideNavigationConfig({ confirmationStrategy })`
 * or by binding this token directly.
 */
export const NAVIGATION_BLOCK_CONFIRMATION = new InjectionToken<NavigationBlockConfirmation>(
  'NAVIGATION_BLOCK_CONFIRMATION',
  {
    providedIn: 'root',
    factory: () => inject(BrowserConfirmationStrategy)
  }
);
