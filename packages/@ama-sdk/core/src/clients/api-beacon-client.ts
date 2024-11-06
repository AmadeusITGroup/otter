import type {
  ApiTypes
} from '../fwk/api';
import {
  extractQueryParams,
  filterUndefinedValues,
  prepareUrl,
  processFormData,
  tokenizeRequestOptions
} from '../fwk/api.helpers';
import type {
  PartialExcept
} from '../fwk/api.interface';
import type {
  ApiClient,
  RequestOptionsParameters
} from '../fwk/core/api-client';
import type {
  BaseApiClientOptions
} from '../fwk/core/base-api-constructor';
import type {
  RequestBody,
  RequestOptions,
  TokenizedOptions
} from '../plugins';

/**
 * @see BaseApiClientOptions
 * @deprecated Use the one exposed by {@link @ama-sdk/client-beacon}, will be removed in v13
 */
export interface BaseApiBeaconClientOptions extends BaseApiClientOptions {
  /** @inheritdoc */
  replyPlugins: never[];
}

/**
 * @see BaseApiConstructor
 * @deprecated Use the one exposed by {@link @ama-sdk/client-beacon}, will be removed in v13
 */
export interface BaseApiBeaconClientConstructor extends PartialExcept<Omit<BaseApiBeaconClientOptions, 'replyPlugins'>, 'basePath'> {
}

const DEFAULT_OPTIONS: Omit<BaseApiBeaconClientOptions, 'basePath'> = {
  replyPlugins: [] as never[],
  requestPlugins: [],
  enableTokenization: false
};

/**
 * Determine if the given value is a promise
 * @deprecated Use the one exposed by {@link @ama-sdk/client-beacon}, will be removed in v13
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
  public getRequestOptions(options: RequestOptionsParameters): Promise<RequestOptions> {
    if (options.method.toUpperCase() !== 'POST') {
      throw new Error(`Unsupported method: ${options.method}. The beacon API only supports POST.`);
    }

    let opts: RequestOptions = {
      ...options,
      headers: new Headers(filterUndefinedValues(options.headers)),
      queryParams: filterUndefinedValues(options.queryParams)
    };
    if (this.options.requestPlugins) {
      for (const plugin of this.options.requestPlugins) {
        const changedOpt = plugin.load({ logger: this.options.logger, apiName: options.api?.apiName }).transform(opts);
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
