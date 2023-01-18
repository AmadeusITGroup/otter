import type { RequestBody, RequestMetadata, RequestOptions, TokenizedOptions } from '../../plugins';
import type { ApiTypes } from '../api';
import { extractQueryParams, filterUndefinedValues, prepareUrl, processFormData, tokenizeRequestOptions } from '../api.helpers';
import type { ApiClient } from '../core/api-client';
import type { BaseApiClientOptions } from '../core/base-api-constructor';

/** @see BaseApiClientOptions */
export interface BaseApiBeaconClientOptions extends BaseApiClientOptions {
  /** @inheritdoc */
  replyPlugins: never[];
}

/** @see BaseApiConstructor */
export interface BaseApiBeaconClientConstructor extends Partial<Omit<BaseApiBeaconClientOptions, 'replyPlugins'>> {
}

const BASE_PATH = 'https://swapi.dev/api/';

const DEFAULT_OPTIONS: BaseApiBeaconClientOptions = {
  basePath: BASE_PATH,
  replyPlugins: [] as never[],
  requestPlugins: [],
  enableTokenization: false
};

/**
 * Determine if the given value is a promise
 *
 * @param value The value to test
 */
const isPromise = <T>(value: T | Promise<T>): value is Promise<T> => value && typeof (value as any).then === 'function';

/**
 * The Beacon API client is an implementation of the API Client using the Navigator Beacon API.
 * The Beacon API is a low-level API that allows you to send message synchronously. It can be used to send request on window unload or before unload events.
 */
export class ApiBeaconClient implements ApiClient {

  /** @inheritdoc */
  public options = DEFAULT_OPTIONS;

  /**
   * Initialize your API Client instance
   *
   * @param options Configuration of the API Client
   */
  constructor(options?: BaseApiBeaconClientConstructor) {

    if (typeof navigator === 'undefined' || !navigator.sendBeacon) {
      throw new Error('Beacon API is not supported in this context');
    }

    if (options) {
      this.options = {
        ...DEFAULT_OPTIONS,
        ...options
      };
    }
  }

  /** @inheritdoc */
  public extractQueryParams<T extends { [key: string]: any }>(data: T, names: (keyof T)[]): { [p in keyof T]: string; } {
    return extractQueryParams(data, names);
  }

  /** @inheritdoc */
  public prepareOptions(url: string, method: string, queryParams: { [key: string]: string }, headers: { [key: string]: string }, body?: RequestBody,
    tokenizedOptions?: TokenizedOptions, metadata?: RequestMetadata): Promise<RequestOptions> {

    if (method.toUpperCase() !== 'POST') {
      throw new Error(`Unsupported method: ${method}. The beacon API only supports POST.`);
    }

    const options: RequestOptions = {
      method,
      headers: new Headers(filterUndefinedValues(headers)),
      body,
      queryParams: filterUndefinedValues(queryParams),
      basePath: url,
      tokenizedOptions,
      metadata
    };

    let opts = options;
    if (this.options.requestPlugins) {
      for (const plugin of this.options.requestPlugins) {
        const changedOpt = plugin.load().transform(opts);
        if (isPromise(changedOpt)) {
          throw new Error(`Request plugin ${plugin.constructor.name} has async transform method. Only sync methods are supported with the Beacon client.`);
        } else {
          opts = changedOpt;
        }
      }
    }

    return Promise.resolve(opts);
  }

  /** @inheritdoc */
  public prepareUrl(url: string, queryParameters?: { [key: string]: string }): string {
    return prepareUrl(url, queryParameters);
  }

  /** @inheritdoc */
  public tokenizeRequestOptions(url: string, queryParameters: { [key: string]: string }, piiParamTokens: { [key: string]: string }, data: any): TokenizedOptions | undefined {
    return this.options.enableTokenization ? tokenizeRequestOptions(url, queryParameters, piiParamTokens, data) : undefined;
  }

  /** @inheritdoc */
  public processFormData(data: any, type: string): RequestBody {
    return processFormData(data, type);
  }

  /** @inheritdoc */
  public processCall(url: string, options: RequestOptions, _apiType: string | ApiTypes, _apiName: string, _reviver?: unknown, _operationId?: unknown): Promise<any> {
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
