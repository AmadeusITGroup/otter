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
  MFE_HOST_APPLICATION_ID_PARAM,
  MFE_HOST_URL_PARAM,
  MFE_MODULE_APPLICATION_ID_PARAM,
} from './host-info';

/**
 * A pipe that adds the host information in the URL of an iframe,
 */
@Pipe({
  name: 'hostInfo'
})
export class HostInfoPipe implements PipeTransform {
  private readonly domSanitizer = inject(DomSanitizer);

  /**
   * Transforms the given URL or SafeResourceUrl by appending query parameters.
   * @param url - The URL or SafeResourceUrl to be transformed.
   * @param options - hostId and moduleId
   * @returns - The transformed SafeResourceUrl or undefined if the input URL is invalid.
   */
  public transform(url: string, options: { hostId: string; moduleId?: string }): string;
  public transform(url: SafeResourceUrl, options: { hostId: string; moduleId?: string }): SafeResourceUrl;
  public transform(url: undefined, options: { hostId: string; moduleId?: string }): undefined;
  public transform(url: string | SafeResourceUrl | undefined, options: { hostId: string; moduleId?: string }): string | SafeResourceUrl | undefined {
    const urlString = typeof url === 'string'
      ? url
      : this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, url || null);

    if (!url) {
      return undefined;
    }

    if (urlString) {
      const moduleUrl = new URL(urlString);
      moduleUrl.searchParams.set(MFE_HOST_URL_PARAM, window.location.origin);
      moduleUrl.searchParams.set(MFE_HOST_APPLICATION_ID_PARAM, options.hostId);
      if (options.moduleId) {
        moduleUrl.searchParams.set(MFE_MODULE_APPLICATION_ID_PARAM, options.moduleId);
      }

      const moduleUrlStringyfied = moduleUrl.toString();
      return typeof url === 'string' ? moduleUrlStringyfied : this.domSanitizer.bypassSecurityTrustResourceUrl(moduleUrlStringyfied);
    }
  }
}
