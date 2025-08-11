import {
  inject,
  Pipe,
  PipeTransform,
  SecurityContext,
} from '@angular/core';
import {
  DomSanitizer,
  type SafeResourceUrl,
} from '@angular/platform-browser';
import {
  ActivatedRoute,
} from '@angular/router';
import {
  RouteMemorizeService,
} from './route-memorize/route-memorize.service';

/**
 * Options for restoring a route with optional query parameters and memory channel ID.
 */
export interface RestoreRouteOptions {
  /**
   * Whether to propagate query parameters from the top window to the module URL.
   */
  propagateQueryParams?: boolean;

  /**
   * Whether to override existing query parameters in the module URL with those from the top window.
   */
  overrideQueryParams?: boolean;

  /**
   * The memory channel ID used to retrieve the memorized route.
   * If provided, the memorized route associated with this ID will be used.
   */
  memoryChannelId?: string;
}

/**
 * A pipe that restores a route with optional query parameters and memory channel ID.
 *
 * This pipe is used to transform a URL or SafeResourceUrl by appending query parameters
 * and adjusting the pathname based on the current active route and memorized route.
 */
@Pipe({
  name: 'restoreRoute'
})
export class RestoreRoute implements PipeTransform {
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly routeMemorizeService = inject(RouteMemorizeService, { optional: true });
  private readonly window: Window = inject(Window, { optional: true }) || window;

  /**
   * Transforms the given URL or SafeResourceUrl by appending query parameters and adjusting the pathname.
   * @param url - The URL or SafeResourceUrl to be transformed.
   * @param options - Optional parameters to control the transformation. {@see RestoreRouteOptions}
   * @returns - The transformed SafeResourceUrl or undefined if the input URL is invalid.
   */
  public transform(url: string, options?: Partial<RestoreRouteOptions>): string;
  public transform(url: SafeResourceUrl, options?: Partial<RestoreRouteOptions>): SafeResourceUrl;
  public transform(url: undefined, options?: Partial<RestoreRouteOptions>): undefined;
  public transform(url: string | SafeResourceUrl | undefined, options?: Partial<RestoreRouteOptions>): string | SafeResourceUrl | undefined {
    const urlString = typeof url === 'string'
      ? url
      : this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, url || null);

    if (!url) {
      return undefined;
    }

    if (urlString) {
      const moduleUrl = new URL(urlString);
      const queryParamsModule = new URLSearchParams(moduleUrl.searchParams);

      const channelId = options?.memoryChannelId;
      const memorizedRoute = channelId && this.routeMemorizeService?.getRoute(channelId);
      const topWindowUrl = new URL(memorizedRoute ? this.window.origin + memorizedRoute : this.window.location.href);
      const queryParamsTopWindow = new URLSearchParams(topWindowUrl.search);

      if (options?.propagateQueryParams) {
        for (const [key, value] of queryParamsTopWindow) {
          if (options?.overrideQueryParams || !queryParamsModule.has(key)) {
            queryParamsModule.set(key, value);
          }
        }
      }
      moduleUrl.search = queryParamsModule.toString();
      moduleUrl.pathname += topWindowUrl.pathname.split(`/${this.activeRoute.routeConfig?.path}`).pop() || '';
      moduleUrl.pathname = moduleUrl.pathname.replace(/\/{2,}/g, '/');
      const moduleUrlStringyfied = moduleUrl.toString();
      return typeof url === 'string' ? moduleUrlStringyfied : this.domSanitizer.bypassSecurityTrustResourceUrl(moduleUrlStringyfied);
    }
  }
}
