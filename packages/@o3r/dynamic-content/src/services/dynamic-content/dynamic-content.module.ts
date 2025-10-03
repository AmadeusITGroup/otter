import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
  type Provider,
} from '@angular/core';
import {
  O3rDynamicContentPipe,
} from './dynamic-content.pipe';
import {
  DynamicContentService,
} from './dynamic-content.service';
import {
  CMS_ASSETS_PATH_TOKEN,
  DYNAMIC_CONTENT_BASE_PATH_TOKEN,
} from './dynamic-content.token';

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

/**
 * DynamicContent module
 * @deprecated Will be removed in v14.
 */
@NgModule({
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
  imports: [O3rDynamicContentPipe],
  exports: [O3rDynamicContentPipe]
})
export class DynamicContentModule {
  /**
   * Customize the location where the application will search for the base path of dynamic content
   * @param dynamicPath Configuration for dynamic content path
   * @param dynamicPath.content The string will be used as base path of dynamic content
   * @param dynamicPath.cmsAssets The string will be used for the the base path of cms assets
   * @note The cmsAssets will be used only in the cms editor mode and it will take priority over dynamic content
   * @deprecated Please use {@link provideDynamicContent} instead. Will be removed in v14.
   */
  public static forRoot(dynamicPath: { content: string } | { cmsAssets: string }): ModuleWithProviders<DynamicContentModule> {
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

type DynamicContentFeatureKind = 'base-path' | 'cms-assets-path';

interface DynamicContentFeature<FeatureKind extends DynamicContentFeatureKind> {
  ɵkind: FeatureKind;
  ɵproviders: Provider[];
}

type BasePathFeature = DynamicContentFeature<'base-path'>;
type CmsAssetsPathFeature = DynamicContentFeature<'cms-assets-path'>;

type DynamicContentFeatures = BasePathFeature | CmsAssetsPathFeature;

/**
 * Specify a custom base path
 * @param basePath
 */
export function withBasePath(basePath: string | (() => string)): BasePathFeature {
  return {
    ɵkind: 'base-path',
    ɵproviders: [
      {
        provide: DYNAMIC_CONTENT_BASE_PATH_TOKEN,
        ...(
          typeof basePath === 'string'
            ? { useValue: basePath }
            : { useFactory: basePath }
        )
      }
    ]
  };
}

/**
 * Specify a custom CMS assets path
 * @param cmsAssetsPath
 */
export function withCmsAssetsPath(cmsAssetsPath: string | (() => string)): DynamicContentFeature<'cms-assets-path'> {
  return {
    ɵkind: 'cms-assets-path',
    ɵproviders: [
      {
        provide: CMS_ASSETS_PATH_TOKEN,
        ...(
          typeof cmsAssetsPath === 'string'
            ? { useValue: cmsAssetsPath }
            : { useFactory: cmsAssetsPath }
        )
      }
    ]
  };
}

/**
 * Provide dynamic content default configuration.
 * To customize the location where the application will search for the base path of dynamic content
 * @see {@link withBasePath}
 * @see {@link withCmsAssetsPath}
 * @note The cmsAssets will be used only in the cms editor mode and it will take priority over dynamic content
 * @param features
 * @example
 * ```typescript
 * bootstrapApplication(App,
 *  {
 *    providers: [
 *      provideDynamicContent(
 *        withBasePath('custom/base/path'),
 *        withCmsAssetsPath('custom/cms/assets/path'),
 *      )
 *    ]
 *  }
 * );
 */
export function provideDynamicContent(...features: DynamicContentFeatures[]) {
  const providers: (Provider | EnvironmentProviders)[] = [
    DynamicContentService
  ];

  const basePathFeature = features.find((f) => f.ɵkind === 'base-path') ?? withBasePath(getDynamicContent);
  providers.push(basePathFeature.ɵproviders);

  const cmsAssetsPathFeature = features.find((f) => f.ɵkind === 'cms-assets-path') ?? withCmsAssetsPath(getCmsAssets);
  providers.push(cmsAssetsPathFeature.ɵproviders);

  return makeEnvironmentProviders(providers);
}
