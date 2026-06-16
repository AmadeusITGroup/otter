import {
  NAVIGATION_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import type {
  NavigationMessage,
  NavigationV1_0,
  NavigationV1_1,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  Subject,
} from 'rxjs';
import {
  hostQueryParams,
} from '../host-info';
import {
  AbstractMessageConsumer,
} from '../managers/index';

/**
 * A service that handles navigation messages and routing.
 *
 * This service listens for navigation messages and updates the router state accordingly.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationConsumerService extends AbstractMessageConsumer<NavigationMessage> {
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly requestedUrl = new Subject<{ url: string; channelId?: string }>();

  /**
   * An observable that emits the requested URL and optional channel ID.
   */
  public readonly requestedUrl$ = this.requestedUrl.asObservable();

  /**
   * The type of messages this service handles.
   */
  public readonly type = NAVIGATION_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly supportedVersions = {
    /**
     * Use the message paylod to compute a new url and emit it via the public subject
     * Additionally navigate to the new url
     * @param message message to consume
     */
    '1.0': (message: RoutedMessage<NavigationV1_0>) => {
      const channelId = message.from || undefined;
      this.requestedUrl.next({ url: message.payload.url, channelId });
      this.navigate(message.payload.url);
    },
    /**
     * Same as 1.0 but applies the navigation extras (e.g. replaceUrl) forwarded by the producer
     * so the host router reproduces the original history semantics.
     * @param message message to consume
     */
    // eslint-disable-next-line @stylistic/quote-props -- keep quotes for consistency with '1.0'
    '1.1': (message: RoutedMessage<NavigationV1_1>) => {
      const channelId = message.from || undefined;
      this.requestedUrl.next({ url: message.payload.url, channelId });
      this.navigate(message.payload.url, message.payload.extras);
    }
  };

  constructor() {
    super();
  }

  /**
   * Parses a URL and returns an object containing the paths and query parameters.
   * @param url - The URL to parse.
   * @returns An object containing the paths and query parameters.
   */
  private parseUrl(url: string): { paths: string[]; queryParams: { [key: string]: string } } {
    const urlObject = new URL(window.origin + url);
    const paths = urlObject.pathname.split('/').filter((segment) => !!segment);
    const queryParams = Object.fromEntries(urlObject.searchParams.entries());
    return { paths, queryParams };
  }

  /**
   * Navigates to the specified URL.
   * @param url - The URL to navigate to.
   * @param extras - Optional navigation extras forwarded from the embedded application.
   */
  private navigate(url: string, extras?: NavigationV1_1['extras']) {
    const { paths, queryParams } = this.parseUrl(url);
    // No need to keep these in the URL
    hostQueryParams.forEach((key) => delete queryParams[key]);
    void this.router.navigate(paths, {
      relativeTo: this.activeRoute.children.at(-1),
      queryParams,
      replaceUrl: extras?.replaceUrl
    });
  }
}
