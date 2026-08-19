import type {
  NavigationMessage,
  NavigationV1_0,
  NavigationV1_1,
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
  private readonly window = inject(Window, { optional: true }) || window;

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
      // Navigation has been triggered from the communication protocol request.
      await this.router.navigateByUrl(message.payload.url, { state: { triggeredByMessage: true } });
    },
    // eslint-disable-next-line @stylistic/quote-props -- keep quotes for consistency with '1.0'
    '1.1': async (message: RoutedMessage<any>) => {
      // Navigation has been triggered from the communication protocol request.
      await this.router.navigateByUrl(message.payload.url, {
        state: { triggeredByMessage: true },
        replaceUrl: message.payload.extras?.replaceUrl
      });
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
   * @param options - Optional parameters to control the routing behavior {@link RoutingServiceOptions}.
   */
  public handleEmbeddedRouting(options?: RoutingServiceOptions): void {
    const subRouteOnly = options?.subRouteOnly ?? false;
    this.router.events.pipe(
      takeUntilDestroyed(),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((_event) => {
        const extras = this.router.getCurrentNavigation()?.extras || {};
        // Navigation triggered by the application host, no need to request it to navigate to the same route
        return !extras.skipLocationChange && !extras.state?.triggeredByMessage;
      }),
      map(({ urlAfterRedirects }) => {
        const extras = this.router.getCurrentNavigation()?.extras || {};
        const { channelId } = extras.state || {};
        const currentRouteRegExp = subRouteOnly && this.activatedRoute.routeConfig?.path && new RegExp('^' + this.activatedRoute.routeConfig.path.replace(/(?=\W)/g, '\\'), 'i');
        return ({
          url: currentRouteRegExp ? urlAfterRedirects.replace(currentRouteRegExp, '') : urlAfterRedirects,
          channelId,
          replaceUrl: extras.replaceUrl
        });
      })
    ).subscribe(({ url, channelId, replaceUrl }) => {
      // Always emit the latest version we produce. The ConsumerManagerService dispatches to the
      // highest compatible minor a consumer has declared, so v1.0-only peers still navigate
      // correctly — they just ignore the optional extras.
      const message: NavigationV1_1 = {
        type: 'navigation',
        version: '1.1',
        url,
        ...(replaceUrl ? { extras: { replaceUrl: true } } : {})
      };
      // TODO: sendBest() is not implemented -- https://github.com/AmadeusITGroup/microfrontends/issues/11
      // When multiple majors are supported, sendBest should receive the latest minor of each
      // supported major and dispatch to peers according to their declared compatibility.
      if (isEmbedded(this.window)) {
        this.messageService.send(message);
      } else if (channelId === undefined) {
        this.logger.warn('No channelId provided for navigation message');
      } else {
        try {
          this.messageService.send(message, { to: [channelId] });
        } catch (error) {
          this.logger.error('Error sending navigation message', error);
        }
      }
    });
  }
}
