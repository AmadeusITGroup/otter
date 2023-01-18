import { ApiClient } from './core/api-client';

/** Identified API interface */
export interface ApiName {
  /** API name */
  apiName: string;
}

/** API interface */
export interface Api extends ApiName {
  /** API Client used to process the calls to the API */
  client: ApiClient;
}

/** API constructor interface */
export interface ApiConstructor<T extends Api = Api> extends ApiName {
  new (client: ApiClient): T;
}
