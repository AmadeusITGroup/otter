import {
  Injectable,
} from '@angular/core';

/**
 * This service allows routes to be memorized with an optional lifetime and provides methods to retrieve and manage these routes.
 */
@Injectable({
  providedIn: 'root'
})
export class RouteMemorizeService {
  private readonly routeTimers: { [x: string]: ReturnType<typeof setTimeout> } = {};
  /** All memorized routes */
  public readonly routeStack: { [x: string]: string } = {};

  /**
   * Memorizes a route for a given channel ID with an optional lifetime.
   * @param channelId - The ID of the channel to memorize the route for.
   * @param url - The URL of the route to memorize.
   * @param liveTime - The optional lifetime of the memorized route in milliseconds. If provided, the route will be removed after this time.
   */
  public memorizeRoute(channelId: string, url: string, liveTime?: number): void {
    this.routeStack[channelId] = url;

    const timerRef = this.routeTimers[channelId];
    if (timerRef) {
      clearTimeout(timerRef);
    }
    if (liveTime && liveTime > 0) {
      this.routeTimers[channelId] = setTimeout(() => {
        delete this.routeStack[channelId];
        delete this.routeTimers[channelId];
      }, liveTime);
    }
  }

  /**
   * Retrieves the memorized route for a given channel ID.
   * @param channelId - The ID of the channel to retrieve the memorized route for.
   * @returns The memorized route URL or undefined if no route is memorized for the given channel ID.
   */
  public getRoute(channelId: string): string | undefined {
    return this.routeStack[channelId];
  }
}
