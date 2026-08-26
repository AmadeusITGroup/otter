import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  NavigationBlockStateConsumerService,
} from '../block-state/navigation-block-state-consumer.service';
import {
  NavigationBlockConfirmationService,
} from '../navigation-confirmation/navigation-block-confirmation.service';
import {
  NAVIGATION_REQUEST_HANDLER,
  type NavigationRequestHandler,
} from './navigation-request-handler';

/**
 * Shell application `navigation-request` handler used when a module initiates the navigation (in-iframe link click).
 * Opens the shared confirmation modal, awaits the user's answer, and — on confirm — clears the shell's block mirror.
 * On cancel the handler throws; the consumer catches it and replies with a `navigation-decision` carrying `proceed: false`,
 * so the module's pending promise resolves to `false` and the iframe navigation is held until a fresh request is made.
 */
export const createNavigationRequestShellHandler = (): NavigationRequestHandler => {
  const confirmation = inject(NavigationBlockConfirmationService);
  const blockConsumer = inject(NavigationBlockStateConsumerService);
  return {
    handle: async ({ reason }) => {
      const confirmed = await confirmation.confirm(reason);
      if (!confirmed) {
        throw new Error('navigation-request cancelled by user');
      }
      blockConsumer.clear();
    }
  };
};

/**
 * Provider wiring {@link NAVIGATION_REQUEST_HANDLER} to the shell application
 * handler. Register once in the shell app providers to override the default
 * module handler.
 */
export const provideNavigationRequestShellHandler = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: NAVIGATION_REQUEST_HANDLER,
      useFactory: createNavigationRequestShellHandler
    }
  ]);
