import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  createNavigationRequestHandler,
  NAVIGATION_REQUEST_HANDLER,
} from './navigation-request-handler';

/**
 * Provider wiring {@link NAVIGATION_REQUEST_HANDLER} to the module handler.
 * Not normally needed — the token already defaults to this handler — but
 * available for apps that want to register it explicitly.
 */
export const provideNavigationRequestModuleHandler = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: NAVIGATION_REQUEST_HANDLER,
      useFactory: createNavigationRequestHandler
    }
  ]);
