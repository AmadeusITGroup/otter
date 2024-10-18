import {
  ApiTypes
} from '../fwk/api';
import {
  extractQueryParams,
  filterUndefinedValues,
  getResponseReviver,
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
import {
  BaseApiClientOptions
} from '../fwk/core/base-api-constructor';
import {
  CanceledCallError,
  EmptyResponseError,
  ResponseJSONParseError
} from '../fwk/errors';
import {
  ReviverType
} from '../fwk/Reviver';
import type {
  FetchCall,
  FetchPlugin,
  PluginAsyncRunner,
  PluginAsyncStarter,
  RequestOptions,
  TokenizedOptions
} from '../plugins/core/index';
import {
  ExceptionReply
} from '../plugins/exception';
import {
  ReviverReply
} from '../plugins/reviver';

/**
 * @see BaseApiClientOptions
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export interface BaseApiFetchClientOptions extends BaseApiClientOptions {
  /** List of plugins to apply to the fetch call */
  fetchPlugins: FetchPlugin[];
}

/**
 * @see BaseApiConstructor
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export interface BaseApiFetchClientConstructor extends PartialExcept<BaseApiFetchClientOptions, 'basePath'> {
}

const DEFAULT_OPTIONS: Omit<BaseApiFetchClientOptions, 'basePath'> = {
  replyPlugins: [new ReviverReply(), new ExceptionReply()],
  fetchPlugins: [],
  requestPlugins: [],
  enableTokenization: false,
  disableFallback: false
};

/**
 * Client to process the call to the API using Fetch API
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export class ApiFetchClient implements ApiClient {
  /** @inheritdoc */
  public options: BaseApiFetchClientOptions;

  /**
   * Initialize your API Client instance
   * @param options Configuration of the API Client
   */
  constructor(options: BaseApiFetchClientConstructor) {
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
  public tokenizeRequestOptions(url: string, queryParameters: { [key: string]: string }, piiParamTokens: { [key: string]: string }, data: any): TokenizedOptions | undefined {
    return this.options.enableTokenization ? tokenizeRequestOptions(url, queryParameters, piiParamTokens, data) : undefined;
  }

  /** @inheritdoc */
  public async getRequestOptions(requestOptionsParameters: RequestOptionsParameters): Promise<RequestOptions> {
    let opts: RequestOptions = {
      ...requestOptionsParameters,
      headers: new Headers(filterUndefinedValues(requestOptionsParameters.headers)),
      queryParams: filterUndefinedValues(requestOptionsParameters.queryParams)
    };
    if (this.options.requestPlugins) {
      for (const plugin of this.options.requestPlugins) {
        opts = await plugin.load({
          logger: this.options.logger,
          apiName: requestOptionsParameters.api?.apiName
        }).transform(opts);
      }
    }

    return opts;
  }

  /** @inheritdoc */
  public prepareUrl(url: string, queryParameters: { [key: string]: string | undefined } = {}) {
    return prepareUrl(url, queryParameters);
  }

  /** @inheritdoc */
  public processFormData(data: any, type: string) {
    return processFormData(data, type);
  }

  /** @inheritdoc */
  public async processCall(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, revivers?: undefined, operationId?: string): Promise<void>;
  public async processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes, apiName: string, revivers: ReviverType<T> | { [statusCode: number]: ReviverType<T> | undefined },
    operationId?: string): Promise<T>;
  public async processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string,
    revivers?: ReviverType<T> | { [statusCode: number]: ReviverType<T> | undefined }, operationId?: string): Promise<T> {
    let response: Response | undefined;
    let asyncResponse: Promise<Response>;
    let root: any;
    let body: string | undefined;
    let exception: Error | undefined;

    const origin = options.headers.get('Origin');

    // Execute call
    try {
      const metadataSignal = options.metadata?.signal;
      metadataSignal?.throwIfAborted();

      const controller = new AbortController();
      options.signal = controller.signal;
      metadataSignal?.addEventListener('abort', () => controller.abort());

      const loadedPlugins: (PluginAsyncRunner<Response, FetchCall> & PluginAsyncStarter)[] = [];
      if (this.options.fetchPlugins) {
        loadedPlugins.push(...this.options.fetchPlugins.map((plugin) => plugin.load({
          url,
          options,
          fetchPlugins: loadedPlugins,
          controller,
          apiClient: this,
          logger: this.options.logger,
          apiName
        })));
      }

      const canStart = await Promise.all(loadedPlugins.map((plugin) => !plugin.canStart || plugin.canStart()));
      const isCanceledBy = canStart.indexOf(false);
      if (isCanceledBy >= 0) {
        // One of the fetch plugins cancelled the execution of the call
        asyncResponse = Promise.reject(new CanceledCallError(`Is canceled by the plugin ${isCanceledBy}`, isCanceledBy, this.options.fetchPlugins[isCanceledBy], { apiName, operationId, url, origin }));
      } else {
        asyncResponse = fetch(url, options);
      }

      for (const plugin of loadedPlugins) {
        asyncResponse = plugin.transform(asyncResponse);
      }

      response = await asyncResponse;

      body = await response.text();
    } catch (e: any) {
      exception = e instanceof CanceledCallError ? e : new EmptyResponseError(e.message || 'Fail to Fetch', undefined, { apiName, operationId, url, origin });
    }

    try {
      root = body ? JSON.parse(body) : undefined;
    } catch (e: any) {
      exception = new ResponseJSONParseError(e.message || 'Fail to parse response body', response && response.status || 0, body, { apiName, operationId, url, origin });
    }
    // eslint-disable-next-line no-console
    const reviver = getResponseReviver(revivers, response, operationId, { disableFallback: this.options.disableFallback, log: console.error });
    const replyPlugins = this.options.replyPlugins
      ? this.options.replyPlugins.map((plugin) => plugin.load<T>({
        dictionaries: root && root.dictionaries,
        response,
        reviver,
        apiType,
        apiName,
        exception,
        operationId,
        url,
        origin,
        logger: this.options.logger
      }))
      : [];

    let parsedData = root;
    for (const pluginRunner of replyPlugins) {
      parsedData = await pluginRunner.transform(parsedData);
    }

    if (exception) {
      throw exception;
    }

    return parsedData;
  }
}
