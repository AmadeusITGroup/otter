import {
  Injectable,
} from '@angular/core';
import {
  firstValueFrom,
} from 'rxjs';
import {
  DynamicContentService,
} from '../dynamic-content/index';
import {
  StyleLazyLoaderModule,
} from './style-lazy-loader.module';

/**
 * Interface to describe a style to lazy load from a url.
 */
export interface StyleURL {
  /** url to file */
  href: string;
  /** id of the HTML element */
  id?: string;
  /** html integrity attribute to verify fetched resources */
  integrity?: string;
  /** html crossOrigin attribute for CORS support. */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

/**
 * Service to lazy load a CSS file
 */
@Injectable({
  providedIn: StyleLazyLoaderModule
})
export class StyleLazyLoader {
  private readonly DEFAULT_STYLE_ELEMENT_ID = 'external-theme';

  constructor(private readonly dcService: DynamicContentService) {}

  /**
   * Load a new CSS from an absolute URL, if we already HTML element exists with the url, otherwise
   * @param styleUrlConfig object containing CSS File absolute URL to load, integrity and crossOrigin attributes
   * and the styleId id of the dynamic style in the body tag.
   */
  public loadStyleFromURL(styleUrlConfig: StyleURL) {
    const elementId = styleUrlConfig.id || this.DEFAULT_STYLE_ELEMENT_ID;
    let style = document.querySelector<HTMLLinkElement>(`#${elementId}`);

    if (style === null) {
      style = document.createElement('link');
      style.rel = 'stylesheet';
      style.type = 'text/css';
      const head = document.querySelectorAll('head')[0];
      head.append(style);
    }
    if (styleUrlConfig.integrity) {
      style.integrity = styleUrlConfig.integrity;
    }
    if (styleUrlConfig.crossOrigin !== undefined) {
      style.crossOrigin = styleUrlConfig.crossOrigin;
    }
    style.href = styleUrlConfig.href;

    return style;
  }

  /**
   * Load a new CSS File
   * @param styleUrlConfig CSS File config containing URL to load, integrity and crossOrigin attributes
   * and the styleId id of the dynamic style in the body tag
   */
  public async asyncLoadStyleFromDynamicContent(styleUrlConfig: StyleURL) {
    const dynamicContentPath = await firstValueFrom(
      this.dcService.getContentPathStream(styleUrlConfig.href)
    );
    styleUrlConfig.href = dynamicContentPath;
    this.loadStyleFromURL(styleUrlConfig);
  }
}
