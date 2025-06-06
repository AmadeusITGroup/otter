import type {
  NavigationMessage,
  NavigationV1_0,
} from '@ama-mfe/messages';
import {
  NAVIGATION_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  LoggerService,
} from '@o3r/logger';
import {
  filter,
  map,
} from 'rxjs';
import {
  type MessageConsumer,
  type MessageProducer,
  registerConsumer,
  registerProducer,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/error';
import {
  isEmbedded,
} from '../utils';

/** Options for the routing handling in case of navigation producer message  */
export interface RoutingServiceOptions {
  /**
   * Whether to handle only sub-routes.
   * If true, the routing service will handle only sub-routes.
   * Default is false.
   */
  subRouteOnly?: boolean;
}

/**
 * A service that keeps in sync Router navigation and navigation messages.
 *
 * - listens to Router events and sends navigation messages
 * - handles incoming navigation messages and triggers Router navigation
 */
@Injectable({
  providedIn: 'root'
})
export class RoutingService implements MessageProducer<NavigationMessage>, MessageConsumer<NavigationMessage> {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessagePeerService<NavigationMessage>);
  private readonly logger = inject(LoggerService);

  /**
   * @inheritdoc
   */
  public readonly types = NAVIGATION_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly type = 'navigation';

  /**
   * Use the message payload to navigate to the specified URL.
   * @param message message to consume
   */
  public readonly supportedVersions = {
    '1.0': async (message: RoutedMessage<any>) => {
      await this.router.navigateByUrl(message.payload.url);
    }
  };

  constructor() {
    registerProducer(this);
    registerConsumer(this);
  }

  /**
   * @inheritdoc
   */
  public start(): void {}

  /**
   * @inheritdoc
   */
  public stop(): void {}

  /**
   * @inheritdoc
   */
  public handleError(message: ErrorContent<NavigationV1_0>): void {
    this.logger.error('Error in navigation service message', message);
  }

  /**
   * Handles embedded routing by listening to router events and sending navigation messages to the connected endpoints.
   * It can be a parent window or another iframe
   * @note - This method has to be called in an injection context
   * @param options - Optional parameters to control the routing behavior {@see RoutingServiceOptions}.
   */
  public handleEmbeddedRouting(options?: RoutingServiceOptions): void {
    const subRouteOnly = options?.subRouteOnly ?? false;
    this.router.events.pipe(
      takeUntilDestroyed(),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(({ urlAfterRedirects }) => {
        const channelId = this.router.getCurrentNavigation()?.extras?.state?.channelId;
        const currentRouteRegExp = subRouteOnly && this.activatedRoute.routeConfig?.path && new RegExp('^' + this.activatedRoute.routeConfig.path.replace(/(?=\W)/g, '\\'), 'i');
        return ({ url: currentRouteRegExp ? urlAfterRedirects.replace(currentRouteRegExp, '') : urlAfterRedirects, channelId });
      })
    ).subscribe(({ url, channelId }) => {
      const messageV10 = {
        type: 'navigation',
        version: '1.0',
        url
      } satisfies NavigationV1_0;
      // TODO: sendBest() is not implemented -- https://github.com/AmadeusITGroup/microfrontends/issues/11
      if (isEmbedded()) {
        this.messageService.send(messageV10);
      } else {
        if (channelId === undefined) {
          this.logger.warn('No channelId provided for navigation message');
        } else {
          try {
            this.messageService.send(messageV10, { to: [channelId] });
          } catch (error) {
            this.logger.error('Error sending navigation message', error);
          }
        }
      }
    });
  }
}
