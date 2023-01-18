import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {filter, switchMap} from 'rxjs/operators';

/**
 * Data to inject to the route parameter to specifiy preloading strategy
 */
export interface O3rOnDemandPreloadingData {
  /** List of page reached that trigger preloading */
  preloadOn: string[] | '*' | RegExp;
}

/**
 * Check if the route has preload instructions
 *
 * @param  data Route data
 */
export function hasPreloadingOnDemand(data: any): data is O3rOnDemandPreloadingData {
  if (!data) {
    return false;
  }

  return (Array.isArray(data.preloadOn) && !!data.preloadOn.length)
    || data.preloadOn === '*'
    || data.preloadOn instanceof RegExp;
}

/**
 * Otter Preloading strategy base on previous route
 *
 * @inheritDoc
 */
@Injectable()
export class O3rOnNavigationPreloadingStrategy implements PreloadingStrategy {

  constructor(private router: Router) {}

  /**
   * Check if the module should be preloaded based on the data preload array of routes or regex value
   *
   * @param data Route data
   * @param url
   * @url url URL of current page
   */
  private isUrlMatchingPreloadConfig(data: any, url: string): boolean {
    return (Array.isArray(data.preloadOn) && data.preloadOn.indexOf(url) !== -1)
      || (data.preloadOn instanceof RegExp && data.preloadOn.test(url));
  }

  /** @inheritDoc */
  public preload(route: Route, preload: () => Observable<any>): Observable<any> {
    if ((route.path || route.matcher) && hasPreloadingOnDemand(route.data)) {

      // On application landing page, check the route to preload.
      if (route.data.preloadOn === '*' || this.isUrlMatchingPreloadConfig(route.data, this.router.routerState.snapshot.url)) {
        return preload();
      }

      // On route navigation end, load the routes to preload for the current route.
      return this.router.events
        .pipe(
          filter((r) => r instanceof NavigationEnd && this.isUrlMatchingPreloadConfig(route.data, r.url)),
          switchMap(() => preload())
        );
    }
    return of(null);
  }
}
