import type {
  ApiClient,
  ApiTypes,
  BaseApiClientOptions,
  ParamSerialization,
  PartialExcept,
  RequestOptions,
  RequestOptionsParameters,
  SupportedParamType,
  TokenizedOptions,
} from '@ama-sdk/core';
import {
  extractQueryParams,
  filterUndefinedValues,
  getPropertiesFromData,
  prepareUrl,
  prepareUrlWithQueryParams,
  processFormData,
  serializePathParams,
  serializeQueryParams,
  stringifyQueryParams,
  tokenizeRequestOptions,
} from '@ama-sdk/core';

/** @see BaseApiClientOptions */
export interface BaseApiBeaconClientOptions extends BaseApiClientOptions {
  /** @inheritdoc */
  replyPlugins: never[];
}

/** @see BaseApiConstructor */
export interface BaseApiBeaconClientConstructor extends PartialExcept<Omit<BaseApiBeaconClientOptions, 'replyPlugins'>, 'basePath'> {
}

const DEFAULT_OPTIONS = {
  replyPlugins: [] as never[],
  requestPlugins: [],
  enableTokenization: false,
  enableParameterSerialization: false
} as const satisfies Omit<BaseApiBeaconClientOptions, 'basePath'>;

/**
 * Determine if the given value is a promise
 * @param value The value to test
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint -- the `extends unknown` is required for ESM build with TSC
const isPromise = <T extends unknown>(value: T | Promise<T>): value is Promise<T> => value instanceof Promise;

/**
 * The Beacon API client is an implementation of the API Client using the Navigator Beacon API.
 * The Beacon API is a low-level API that allows you to send message synchronously. It can be used to send request on window unload or before unload events.
 */
export class ApiBeaconClient implements ApiClient {
  /** @inheritdoc */
  public options: BaseApiBeaconClientOptions;

  /**
   * Initialize your API Client instance
   * @param options Configuration of the API Client
   */
  constructor(options: BaseApiBeaconClientConstructor) {
    if (typeof navigator === 'undefined' || !navigator.sendBeacon) {
      throw new Error('Beacon API is not supported in this context');
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
  }

  /** @inheritdoc */
  public extractQueryParams<T extends { [key: string]: any }>(data: T, names: (keyof T)[]): { [p in keyof T]: string; } {
    return extractQueryParams(data, names);
  }

  /** @inheritdoc */
  public getPropertiesFromData<T, K extends keyof T>(data: T, keys: K[]): Pick<T, K> {
    return getPropertiesFromData(data, keys);
  }

  /** @inheritdoc */
  public stringifyQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T): { [p in keyof T]: string; } {
    return stringifyQueryParams(queryParams);
  }

  /** @inheritdoc */
  public getRequestOptions(options: RequestOptionsParameters): Promise<RequestOptions> {
    if (options.method.toUpperCase() !== 'POST') {
      throw new Error(`Unsupported method: ${options.method}. The beacon API only supports POST.`);
    }

    let opts: RequestOptions = {
      ...options,
      headers: new Headers(filterUndefinedValues(options.headers)),
      queryParams: filterUndefinedValues(options.queryParams)
    };
    const requestPlugins = typeof this.options.requestPlugins === 'function'
      ? this.options.requestPlugins(opts)
      : this.options.requestPlugins;
    if (isPromise(requestPlugins)) {
      throw new Error('Only a synchronous function is supported to return the list of Request Plugin for this Client');
    }
    for (const plugin of requestPlugins) {
      const changedOpt = plugin.load({ logger: this.options.logger, apiName: options.api?.apiName }).transform(opts);
      if (isPromise(changedOpt)) {
        throw new Error(`Request plugin ${plugin.constructor.name} has async transform method. Only sync methods are supported with the Beacon client.`);
      } else {
        opts = changedOpt;
      }
    }

    return Promise.resolve(opts);
  }

  /** @inheritdoc */
  public serializeQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T, queryParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string } {
    if (this.options.serializeQueryParams) {
      return this.options.serializeQueryParams(queryParams, queryParamSerialization);
    }
    return serializeQueryParams(queryParams, queryParamSerialization);
  }

  /** @inheritdoc */
  public serializePathParams<T extends { [key: string]: SupportedParamType }>(pathParams: T, pathParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string } {
    if (this.options.serializePathParams) {
      return serializePathParams(pathParams, pathParamSerialization);
    }
    return serializePathParams(pathParams, pathParamSerialization);
  }

  /** @inheritdoc */
  public prepareUrl(url: string, queryParameters?: { [key: string]: string }): string {
    return prepareUrl(url, queryParameters);
  }

  /** @inheritdoc */
  public prepareUrlWithQueryParams(url: string, serializedQueryParams?: { [key: string]: string }): string {
    return prepareUrlWithQueryParams(url, serializedQueryParams);
  }

  /** @inheritdoc */
  public tokenizeRequestOptions(url: string, queryParameters: { [key: string]: string }, piiParamTokens: { [key: string]: string }, data: any): TokenizedOptions | undefined {
    return this.options.enableTokenization ? tokenizeRequestOptions(url, queryParameters, piiParamTokens, data) : undefined;
  }

  /** @inheritdoc */
  public processFormData(data: any, type: string) {
    return processFormData(data, type);
  }

  /** @inheritdoc */
  public processCall(url: string, options: RequestOptions, _apiType: string | ApiTypes, _apiName: string, _revivers?: unknown, _operationId?: unknown): Promise<any> {
    const headers = {
      type: 'application/json',
      ...options.headers.entries()
    };
    const blob = new Blob(options.body ? [JSON.stringify(options.body)] : [], headers);
    const success = navigator.sendBeacon(url, blob);
    if (!success) {
      throw new Error(`Failed to send beacon to ${url}`);
    }

    return Promise.resolve();
  }
}
