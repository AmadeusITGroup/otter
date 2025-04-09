import {
  stringifyQueryParams,
} from '../../fwk/api.helpers';
import {
  isParamValueRecord,
  type QueryParamValueSerialization,
  serializeRequestPluginQueryParams,
} from '../../fwk/param-serialization';
import {
  PluginRunner,
  RequestOptions,
  RequestPlugin,
  RequestPluginContext,
} from '../core';

export interface AdditionalParameters {
  /** Additional headers */
  headers?: { [key: string]: string } | ((headers: Headers) => { [key: string]: string } | Promise<{ [key: string]: string }>);
  /** Additional query params */
  queryParams?: { [key: string]: string } | { [key: string]: QueryParamValueSerialization }
    | ((defaultValues?: { [key: string]: string } | { [key: string]: QueryParamValueSerialization }) =>
        { [key: string]: string } | { [key: string]: QueryParamValueSerialization } | Promise<{ [key: string]: string }> | Promise<{ [key: string]: QueryParamValueSerialization }>
      );
  /** Additional body params */
  body?: (defaultValues?: string) => string | null | Promise<string>;
}

/**
 * Check if the value is a string or undefined.
 * Used to determine the request body type at runtime.
 * @param value
 */
export function isStringOrUndefined(value: any): value is string | undefined {
  const type = typeof value;
  return type === 'undefined' || type === 'string';
}

/**
 * Plugin to add (or change) the request parameters
 */
export class AdditionalParamsRequest implements RequestPlugin {
  private readonly additionalParams: AdditionalParameters;

  /**
   * Initialize your plugin
   * @param additionalParams Parameters to add or modify
   */
  constructor(additionalParams: AdditionalParameters) {
    this.additionalParams = additionalParams;
  }

  public load(context?: RequestPluginContext): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        const queryParams = typeof this.additionalParams.queryParams === 'function' ? await this.additionalParams.queryParams(data.queryParams) : this.additionalParams.queryParams;
        const headers = typeof this.additionalParams.headers === 'function' ? await this.additionalParams.headers(data.headers) : this.additionalParams.headers;
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
          data.body = body === null ? undefined : await body;
        }

        if (headers) {
          Object.keys(headers).forEach((key) => data.headers.set(key, headers[key]));
        }

        return data;
      }
    };
  }
}
