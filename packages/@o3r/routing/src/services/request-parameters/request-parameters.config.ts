/**
 * Strategies available to read / write data in the RequestParameters service.
 * Rehydrate: if the storage already have data, those will be used by the service, ignoring new data. Otherwise set the storage
 * Merge: storage data will be merged with the ones provided. (provided data has priority)
 * Replace: storage data will be completely replaced by the ones provided
 * ReplaceIfNotEmpty: If no parameters are provided, use the content from storage. Otherwise use the ones provided and update the storage with them.
 *
 * @deprecated use StorageStrategy from @o3r/dynamic-content instead, will be removed in v10
 */
// eslint-disable-next-line no-shadow
export enum StorageStrategy {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Rehydrate = 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Merge = 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Replace = 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ReplaceIfNotEmpty = 3
}

/**
 * Configuration used by a user to feed the request parameters service.
 *
 * @deprecated use RequestParametersConfig from @o3r/dynamic-content instead, will be removed in v10
 */
export interface RequestParametersConfig {
  /**
   * Strategy used by the RequestParameters Service. See StorageStrategy for more info
   */
  strategy: StorageStrategy;
  /**
   * Storage used by the RequestParameters service
   */
  storage?: Storage;
  /**
   * Value of the DOM element containing your query parameters (e.g. `document.body.dataset.query`)
   */
  queryParamsValue: string;
  /**
   * Value of the DOM element containing your post parameters (e.g. `document.body.dataset.post`)
   */
  postParamsValue: string;
}

/**
 * @deprecated use defaultRequestParametersConfig from @o3r/dynamic-content instead, will be removed in v10
 */
export const defaultRequestParametersConfig: RequestParametersConfig = {
  storage: (typeof window !== 'undefined') ? window.sessionStorage : undefined,
  strategy: StorageStrategy.Rehydrate,
  queryParamsValue: typeof document !== 'undefined' && document.body && document.body.dataset && document.body.dataset.query || '{}',
  postParamsValue: typeof document !== 'undefined' && document.body && document.body.dataset && document.body.dataset.post || '{}'
};
