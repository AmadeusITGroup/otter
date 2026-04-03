import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  type Provider,
} from '@angular/core';
import {
  DynamicContentService,
} from './dynamic-content-service';
import {
  CMS_ASSETS_PATH_TOKEN,
  DYNAMIC_CONTENT_BASE_PATH_TOKEN,
} from './dynamic-content-token';

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
