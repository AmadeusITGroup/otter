import {
  computed,
  Directive,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import {
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  NavigationConsumerService,
} from '../navigation-consumer-service';
import {
  RouteMemorizeService,
} from './route-memorize-service';

@Directive({
  selector: 'iframe[memorizeRoute]',
  standalone: true
})
export class RouteMemorizeDirective {
  /**
   * Whether to memorize the route.
   * Default is true.
   */
  public memorizeRoute = input<boolean | undefined | ''>(true);

  /**
   * The ID used to memorize the route.
   */
  public memorizeRouteId = input<string>();

  /**
   * The maximum age for memorizing the route.
   * Default is 0.
   */
  public memorizeMaxAge = input<number>(0);

  /**
   * The maximum age for memorizing the route, used as a fallback.
   * Default is 0.
   */
  public memorizeRouteMaxAge = input<number>(0);

  /**
   * The connection ID for the iframe where the actual directive is applied.
   */
  public connect = input<string>();

  private readonly maxAge = computed(() => {
    return this.memorizeMaxAge() || this.memorizeRouteMaxAge();
  });

  constructor() {
    const memory = inject(RouteMemorizeService);
    const requestedUrlSignal = toSignal(inject(NavigationConsumerService).requestedUrl$);

    /**
     * This effect listens for changes in the `memorizeRoute`, `requestedUrlSignal`, and `memorizeRouteId` or `connect` inputs.
     * If `memorizeRoute` is not false and a requested URL with a matching channel ID is found, it memorizes the route using the route memory service.
     */
    effect(() => {
      const memorizeRoute = this.memorizeRoute();
      if (memorizeRoute === false) {
        return;
      }
      const requested = requestedUrlSignal();
      const channelId = this.connect();
      const id = this.memorizeRouteId() || channelId;
      if (requested && id && requested.channelId === channelId) {
        memory.memorizeRoute(id, requested.url, untracked(this.maxAge));
      }
    });
  }
}
