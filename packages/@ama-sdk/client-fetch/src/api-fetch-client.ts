import type {
  ApiClient,
  ApiTypes,
  BaseApiClientOptions,
  ParamSerialization,
  PartialExcept,
  PluginAsyncRunner,
  RequestOptions,
  RequestOptionsParameters,
  ReviverType,
  SupportedParamType,
  TokenizedOptions,
} from '@ama-sdk/core';
import {
  CanceledCallError,
  EmptyResponseError,
  ExceptionReply,
  extractQueryParams,
  filterUndefinedValues,
  getPropertiesFromData,
  getResponseReviver,
  prepareUrl,
  prepareUrlWithQueryParams,
  processFormData,
  RequestFailedError,
  ResponseJSONParseError,
  ReviverReply,
  serializePathParams,
  serializeQueryParams,
  stringifyQueryParams,
  tokenizeRequestOptions,
} from '@ama-sdk/core';
import type {
  FetchCall,
  FetchPlugin,
  PluginAsyncStarter,
} from './fetch-plugin';

/** @see BaseApiClientOptions */
export interface BaseApiFetchClientOptions extends BaseApiClientOptions {
  /** List of plugins to apply to the fetch call */
  fetchPlugins: FetchPlugin[] | ((requestOpts: RequestOptions) => FetchPlugin[] | Promise<FetchPlugin[]>);
}

/** @see BaseApiConstructor */
export interface BaseApiFetchClientConstructor extends PartialExcept<BaseApiFetchClientOptions, 'basePath'> {
}

const DEFAULT_OPTIONS = {
  replyPlugins: [new ReviverReply(), new ExceptionReply()],
  fetchPlugins: [],
  requestPlugins: [],
  enableTokenization: false,
  disableFallback: false,
  enableParameterSerialization: false
} as const satisfies Omit<BaseApiFetchClientOptions, 'basePath'>;

/** Client to process the call to the API using Fetch API */
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
  public getPropertiesFromData<T, K extends keyof T>(data: T, keys: K[]): Pick<T, K> {
    return getPropertiesFromData(data, keys);
  }

  /** @inheritdoc */
  public stringifyQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T): { [p in keyof T]: string; } {
    return stringifyQueryParams(queryParams);
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
    const requestPlugins = typeof this.options.requestPlugins === 'function'
      ? await this.options.requestPlugins(opts)
      : this.options.requestPlugins;
    for (const plugin of requestPlugins) {
      opts = await plugin.load({
        logger: this.options.logger,
        apiName: requestOptionsParameters.api?.apiName
      }).transform(opts);
    }

    return opts;
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
  public prepareUrl(url: string, queryParameters: { [key: string]: string | undefined } = {}) {
    return prepareUrl(url, queryParameters);
  }

  /** @inheritdoc */
  public prepareUrlWithQueryParams(url: string, serializedQueryParams?: { [key: string]: string }): string {
    return prepareUrlWithQueryParams(url, serializedQueryParams);
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
      const fetchPlugins = typeof this.options.fetchPlugins === 'function'
        ? await this.options.fetchPlugins(options)
        : this.options.fetchPlugins;
      loadedPlugins.push(...fetchPlugins.map((plugin) => plugin.load({ url, options, fetchPlugins: loadedPlugins, controller, apiClient: this, logger: this.options.logger })));

      const canStart = await Promise.all(loadedPlugins.map((plugin) => !plugin.canStart || plugin.canStart()));
      const isCanceledBy = canStart.indexOf(false);
      asyncResponse = isCanceledBy === -1
        // One of the fetch plugins cancelled the execution of the call
        ? fetch(url, options)
        : Promise.reject(new CanceledCallError(`Is canceled by the plugin ${isCanceledBy}`, isCanceledBy, fetchPlugins[isCanceledBy], { apiName, operationId, url, origin }));

      for (const plugin of loadedPlugins) {
        asyncResponse = plugin.transform(asyncResponse);
      }

      response = await asyncResponse;

      body = await response.text();
    } catch (e: any) {
      if (e instanceof CanceledCallError) {
        exception = e;
      } else if (response && !Number.isNaN(response.status)) {
        exception = new RequestFailedError(e.message || 'Fail to Fetch', response.status, undefined, {
          apiName,
          operationId,
          url,
          origin
        });
      } else {
        exception = new EmptyResponseError(e.message || 'Fail to Fetch', undefined, {
          apiName,
          operationId,
          url,
          origin
        });
      }
    }

    try {
      root = body ? JSON.parse(body) : undefined;
    } catch (e: any) {
      exception = new ResponseJSONParseError(e.message || 'Fail to parse response body', (response && response.status) || 0, body, { apiName, operationId, url, origin });
    }
    // eslint-disable-next-line no-console -- `console.error` is supposed to be the default value if the `options` argument is not provided, can be removed in Otter v12.
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
