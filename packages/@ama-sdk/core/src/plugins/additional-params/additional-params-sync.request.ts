import {
  stringifyQueryParams,
} from '../../fwk/api.helpers';
import {
  isParamValueRecord,
  type QueryParamValueSerialization,
  serializeRequestPluginQueryParams,
} from '../../fwk/param-serialization';
import {
  PluginSyncRunner,
  RequestOptions,
  RequestPlugin,
  RequestPluginContext,
} from '../core';
import {
  isStringOrUndefined,
} from './additional-params.request';

export interface AdditionalParametersSync {
  /** Additional headers */
  headers?: { [key: string]: string } | ((headers: Headers) => { [key: string]: string });
  /** Additional query params */
  queryParams?: { [key: string]: string } | { [key: string]: QueryParamValueSerialization }
    | ((defaultValues?: { [key: string]: string } | { [key: string]: QueryParamValueSerialization }) => { [key: string]: string } | { [key: string]: QueryParamValueSerialization });
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

  public load(context?: RequestPluginContext): PluginSyncRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        const queryParams = typeof this.additionalParams.queryParams === 'function' ? this.additionalParams.queryParams(data.queryParams) : this.additionalParams.queryParams;
        const headers = typeof this.additionalParams.headers === 'function' ? this.additionalParams.headers(data.headers) : this.additionalParams.headers;
        const body = this.additionalParams.body && isStringOrUndefined(data.body) ? this.additionalParams.body(data.body) : undefined;

        if (queryParams) {
          if (data.paramSerializationOptions?.enableParameterSerialization) {
            if (isParamValueRecord(queryParams)) {
              throw new Error('It is not possible to serialize additional query parameters without their serialization properties `value`, `explode`, and `style`.');
            } else {
              data.queryParams = { ...data.queryParams, ...serializeRequestPluginQueryParams(queryParams) };
            }
          } else {
            if (isParamValueRecord(queryParams)) {
              data.queryParams = { ...data.queryParams, ...queryParams };
            } else {
              const queryParamsValues = Object.fromEntries(Object.entries(queryParams).map(([key, value]) => [key, value.value]));
              data.queryParams = { ...data.queryParams, ...stringifyQueryParams(queryParamsValues) };
              (context?.logger || console).log('The serialization of additional query parameters has been ignored since parameter serialization is not enabled.');
            }
          }
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
