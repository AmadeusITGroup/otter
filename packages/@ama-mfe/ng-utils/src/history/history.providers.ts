import {
  provideAppInitializer,
} from '@angular/core';

/**
 * No operation function used to override the history API methods.
 */
export function noop() {}

/**
 * If an iframe is not sandboxed or is of the same origin, navigation inside it will mess up the main window history.
 * This disables writing to and overriding history API from inside the iframe to prevent this.
 * Theoretically, this might break applications that rely on reading history API from inside the iframe.
 *
 * This should also allow having `CustomPathLocationStrategy` in the iframe if necessary.
 */
export function provideDisableHistoryWrites() {
  return provideAppInitializer(() => {
    Object.defineProperty(history, 'pushState', { value: noop, writable: false, configurable: false });
    Object.defineProperty(history, 'replaceState', { value: noop, writable: false, configurable: false });
  });
}
