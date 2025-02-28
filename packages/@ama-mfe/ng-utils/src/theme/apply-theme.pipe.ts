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
  ThemeProducerService,
} from './theme.producer.service';

/**
 * A pipe that applies the current theme from a theme manager service, to a given URL or SafeResourceUrl, as query param
 */
@Pipe({
  name: 'applyTheme'
})
export class ApplyTheme implements PipeTransform {
  private readonly themeManagerService = inject(ThemeProducerService);
  private readonly domSanitizer = inject(DomSanitizer);

  /**
   * Transforms the given URL or SafeResourceUrl by appending the current theme value as a query parameter.
   * @param url - The URL or SafeResourceUrl to be transformed.
   * @returns The transformed SafeResourceUrl or undefined if the input URL is invalid.
   */
  public transform(url: string): string;
  public transform(url: SafeResourceUrl): SafeResourceUrl;
  public transform(url: undefined): undefined;
  public transform(url: string | SafeResourceUrl | undefined): string | SafeResourceUrl | undefined {
    if (!url) {
      return undefined;
    }
    const currentTheme = this.themeManagerService.currentTheme();
    const urlString = typeof url === 'string'
      ? url
      : this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, url);

    if (urlString) {
      const moduleUrl = new URL(urlString);
      if (currentTheme) {
        moduleUrl.searchParams.set('theme', currentTheme.name);
      }
      const moduleUrlStringyfied = moduleUrl.toString();
      return typeof url === 'string' ? moduleUrlStringyfied : this.domSanitizer.bypassSecurityTrustResourceUrl(moduleUrlStringyfied);
    }

    return undefined;
  }
}
