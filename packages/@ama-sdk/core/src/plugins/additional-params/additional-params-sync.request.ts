import {
  PluginSyncRunner,
  RequestOptions,
  RequestPlugin
} from '../core';
import {
  isStringOrUndefined
} from './additional-params.request';

export interface AdditionalParametersSync {
  /** Additional headers */
  headers?: { [key: string]: string } | ((headers: Headers) => { [key: string]: string });
  /** Additional query params */
  queryParams?: { [key: string]: string } | ((defaultValues?: { [key: string]: string }) => { [key: string]: string });
  /** Additional body params */
  body?: (defaultValues?: string) => string | null;
}

/**
 * Plugin to add (or change) the request parameters
 */
export class AdditionalParamsSyncRequest implements RequestPlugin {
  private readonly additionalParams: AdditionalParametersSync;

  /**
   * Initialize your plugin
   * @param additionalParams Parameters to add or modify
   */
  constructor(additionalParams: AdditionalParametersSync) {
    this.additionalParams = additionalParams;
  }

  public load(): PluginSyncRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        const queryParams = typeof this.additionalParams.queryParams === 'function' ? this.additionalParams.queryParams(data.queryParams) : this.additionalParams.queryParams;
        const headers = typeof this.additionalParams.headers === 'function' ? this.additionalParams.headers(data.headers) : this.additionalParams.headers;
        const body = this.additionalParams.body && isStringOrUndefined(data.body) ? this.additionalParams.body(data.body) : undefined;

        if (queryParams) {
          data.queryParams = { ...data.queryParams, ...queryParams };
        }

        if (body !== undefined) {
          data.body = body === null ? undefined : body;
        }

        if (headers) {
          Object.keys(headers).forEach((key) => data.headers.set(key, headers[key]));
        }

        return data;
      }
    };
  }
}
