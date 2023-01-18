import { ModuleWithProviders, NgModule } from '@angular/core';
import { DynamicContentPipe } from './dynamic-content.pipe';
import { DynamicContentService } from './dynamic-content.service';
import { CMS_ASSETS_PATH_TOKEN, DYNAMIC_CONTENT_BASE_PATH_TOKEN } from './dynamic-content.token';

/**
 * Function to get dynamic content from body dataset
 */
export function getDynamicContent() {
  return document.body.dataset.dynamiccontentpath || '';
}

/**
 * Function to get the cms assets from body dataset
 * This will be used only in a CMS context(not in local or prod) to display correctly the assets in the editor
 */
export function getCmsAssets() {
  return document.body.dataset.cmsassetspath || '';
}

@NgModule({
  declarations: [DynamicContentPipe],
  providers: [
    {
      provide: DYNAMIC_CONTENT_BASE_PATH_TOKEN,
      useFactory: getDynamicContent
    },
    {
      provide: CMS_ASSETS_PATH_TOKEN,
      useFactory: getCmsAssets
    },
    DynamicContentService
  ],
  exports: [DynamicContentPipe]
})
/**
 * DynamicContent module
 */
export class DynamicContentModule {

  /**
   * Customize the location where the application will search for the base path of dynamic content
   *
   * @param dynamicPath Configuration for dynamic content path
   * @param dynamicPath.content The string will be used as base path of dynamic content
   * @param dynamicPath.cmsAssets The string will be used for the the base path of cms assets
   * @note The cmsAssets will be used only in the cms editor mode and it will take priority over dynamic content
   */
  public static forRoot(dynamicPath: {content: string} | {cmsAssets: string}): ModuleWithProviders<DynamicContentModule> {
    const providers = [];
    if ('content' in dynamicPath) {
      providers.push({
        provide: DYNAMIC_CONTENT_BASE_PATH_TOKEN,
        useValue: dynamicPath.content
      });
    }
    if ('cmsAssets' in dynamicPath) {
      providers.push({
        provide: CMS_ASSETS_PATH_TOKEN,
        useValue: dynamicPath.cmsAssets
      });
    }

    return {
      ngModule: DynamicContentModule,
      providers
    };
  }
}
