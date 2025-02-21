import {
  MESSAGE_NAVIGATION_TYPE,
} from '@ama-mfe/messages';
import type {
  Navigation,
  NavigationVersions,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  DestroyRef,
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
  ConsumerManagerService,
  type MessageConsumer,
} from '../managers/index';

/**
 * A service that handles navigation messages and routing.
 *
 * This service listens for navigation messages and updates the router state accordingly.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationConsumerService implements MessageConsumer<NavigationVersions> {
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
  public readonly type = MESSAGE_NAVIGATION_TYPE;

  /**
   * The supported versions of navigation messages and their handlers.
   */
  public readonly supportedVersions = {
    /**
     * Use the message paylod to compute a new url and emit it via the public subject
     * Additionally navigate to the new url
     * @param message message to consume
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- version as key identifier
    '1.0': (message: RoutedMessage<Navigation>) => {
      const channelId = message.from || undefined;
      this.requestedUrl.next({ url: message.payload.url, channelId });
      this.navigate(message.payload.url, channelId);
    }
  };

  private readonly consumerManagerService = inject(ConsumerManagerService);

  constructor() {
    this.start();
    inject(DestroyRef).onDestroy(() => this.stop());
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
   * Navigates to the specified URL with optional channel ID.
   * @param url - The URL to navigate to.
   * @param channelId - The optional channel ID for the navigation state. This is the endpoint from where the message is received
   */
  public navigate(url: string, channelId?: string) {
    const { paths, queryParams } = this.parseUrl(url);
    void this.router.navigate(paths, { relativeTo: this.activeRoute.children.at(-1), queryParams, state: { channelId }, replaceUrl: true });
  }

  /**
   * Starts the navigation handler service by registering it into consumer manager service.
   */
  public start() {
    this.consumerManagerService.register(this);
  }

  /**
   * Stops the navigation handler service by unregistering it from the consumer manager service.
   */
  public stop() {
    this.consumerManagerService.unregister(this);
  }
}
