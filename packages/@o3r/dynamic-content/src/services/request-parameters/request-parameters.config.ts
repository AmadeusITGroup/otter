/**
 * Strategies available to read / write data in the RequestParameters service.
 * Rehydrate: if the storage already have data, those will be used by the service, ignoring new data. Otherwise set the storage
 * Merge: storage data will be merged with the ones provided. (provided data has priority)
 * Replace: storage data will be completely replaced by the ones provided
 * ReplaceIfNotEmpty: If no parameters are provided, use the content from storage. Otherwise use the ones provided and update the storage with them.
 */

export enum StorageStrategy {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- required naming convention
  Rehydrate = 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- required naming convention
  Merge = 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- required naming convention
  Replace = 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- required naming convention
  ReplaceIfNotEmpty = 3
}

/**
 * Configuration used by a user to feed the request parameters service.
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

export const defaultRequestParametersConfig: RequestParametersConfig = {
  storage: (typeof window === 'undefined') ? undefined : window.sessionStorage,
  strategy: StorageStrategy.Rehydrate,
  queryParamsValue: (typeof document !== 'undefined' && document.body?.dataset?.query) || '{}',
  postParamsValue: (typeof document !== 'undefined' && document.body?.dataset?.post) || '{}'
};
