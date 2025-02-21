import type {
  Navigation,
  NavigationVersions,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import {
  filter,
  map,
  switchMap,
} from 'rxjs';
import {
  type MessageProducer,
  ProducerManagerService,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/error';

export interface RoutingServiceOptions {
  /**
   * Whether to handle only sub-routes.
   * If true, the routing service will handle only sub-routes.
   * Default is false.
   */
  subRouteOnly?: boolean;
}

/**
 * A service that handles routing and message production for navigation events.
 *
 * This service listens to Angular router events and sends navigation messages
 * to a message peer service. It also handles errors related to navigation messages.
 */
@Injectable({
  providedIn: 'root'
})
export class RoutingService implements MessageProducer<NavigationVersions> {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessagePeerService<NavigationVersions>);

  public readonly types = 'navigation';

  private readonly takeUntilDestroyedOperator = takeUntilDestroyed();

  constructor() {
    const producerManagerService = inject(ProducerManagerService);
    producerManagerService.register(this);

    inject(DestroyRef).onDestroy(() => {
      producerManagerService.unregister(this);
    });
  }

  /**
   * Handles errors related to navigation messages.
   * @param message - The error message content.
   */
  public handleError(message: ErrorContent<Navigation>): void {
    // TODO https://github.com/AmadeusITGroup/otter/issues/2887 - proper logger
    // eslint-disable-next-line no-console -- placeholder for the implementation with a logger
    console.error('Error in navigation service message', message);
  }

  /**
   * Handles embedded routing by listening to router events and sending navigation messages to the connected endpoints.
   * It can be a parent window or another iframe
   * @param options - Optional parameters to control the routing behavior {@see RoutingServiceOptions}.
   */
  public handleEmbeddedRouting(options?: RoutingServiceOptions): void {
    const subRouteOnly = options?.subRouteOnly ?? false;
    this.router.events.pipe(
      this.takeUntilDestroyedOperator,
      filter((event): event is NavigationStart => event instanceof NavigationStart),
      switchMap((a) => {
        return this.router.events.pipe(
          this.takeUntilDestroyedOperator,
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          map(({ urlAfterRedirects }) => {
            const currentRouteRegExp = subRouteOnly && this.activatedRoute.routeConfig?.path && new RegExp('^' + this.activatedRoute.routeConfig.path.replace(/(?=\W)/g, '\\'), 'i');
            return ({ url: currentRouteRegExp ? urlAfterRedirects.replace(currentRouteRegExp, '') : urlAfterRedirects, channelId: a.restoredState?.channelId as string | undefined });
          })
        );
      })
    ).subscribe(({ url, channelId }) => {
      const messageV10 = {
        type: 'navigation',
        version: '1.0',
        url
      } satisfies Navigation;
      // TODO: sendBest() is not implemented
      if (document.referrer) {
        this.messageService.send(messageV10);
      } else {
        if (channelId === undefined) {
          // TODO https://github.com/AmadeusITGroup/otter/issues/2887 - proper logger
          // eslint-disable-next-line no-console -- warning message as channel id not mandatory
          console.warn('No channelId provided for navigation message');
        } else {
          try {
            this.messageService.send(messageV10, { to: [channelId] });
          } catch (error) {
            // TODO https://github.com/AmadeusITGroup/otter/issues/2887 - proper logger
            // eslint-disable-next-line no-console -- send the error in the console, do not fail silently
            console.error('Error sending navigation message', error);
          }
        }
      }
    });
  }
}
