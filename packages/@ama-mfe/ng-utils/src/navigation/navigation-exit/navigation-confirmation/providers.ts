import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  NAVIGATION_BLOCK_CONFIRMATION,
} from './navigation-block-confirmation.interface';
import {
  BrowserConfirmationStrategy,
} from './strategies/browser-confirmation.strategy';

/**
 * Convenience helper that explicitly binds the {@link NAVIGATION_BLOCK_CONFIRMATION} token to {@link BrowserConfirmationStrategy}.
 *
 * **Usually unnecessary** — the token already defaults to `BrowserConfirmationStrategy` via its tree-shakable factory,
 * so the helper only re-binds the same value. Use it when you want the binding to be visible at the call site
 * (e.g. for documentation in `app.config.ts`) or when you've previously overridden the token and want to switch back
 * to the default in a child injector.
 *
 * Production apps with a styled modal pass their own strategy via `provideNavigationConfig({ confirmationStrategy })` instead.
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDefaultNavigationBlockConfirmation(),
 *     // ... other providers
 *   ]
 * };
 * ```
 */
export function provideDefaultNavigationBlockConfirmation(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NAVIGATION_BLOCK_CONFIRMATION,
      useClass: BrowserConfirmationStrategy
    }
  ]);
}
