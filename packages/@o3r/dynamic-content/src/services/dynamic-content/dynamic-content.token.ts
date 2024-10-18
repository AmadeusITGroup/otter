import {
  InjectionToken
} from '@angular/core';

/**
 * Injection token for the rootpath of dynamic content
 */
export const DYNAMIC_CONTENT_BASE_PATH_TOKEN: InjectionToken<string> = new InjectionToken('Dynamic content path injection token');

/**
 * Injection token for the assets path injected by the cms
 * This token will be injected only in editor mode
 */
export const CMS_ASSETS_PATH_TOKEN: InjectionToken<string> = new InjectionToken('CMS assets path injection token');
