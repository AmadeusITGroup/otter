import type {
  ApiClient,
  ApiTypes,
  BaseApiClientOptions,
  ParamSerialization,
  PartialExcept,
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
  ReviverReply,
  serializePathParams,
  serializeQueryParams,
  stringifyQueryParams,
  tokenizeRequestOptions,
} from '@ama-sdk/core';
import type {
  HttpClient,
  HttpResponse,
} from '@angular/common/http';
import type {
  AngularCall,
  AngularPlugin,
  PluginObservableRunner,
} from './angular-plugin';

/** @see BaseApiClientOptions */
export interface BaseApiAngularClientOptions extends BaseApiClientOptions {
  /** Angular HTTP Client  */
  httpClient: HttpClient;
  /** List of plugins to apply to the Angular Http call */
  angularPlugins: AngularPlugin[] | ((requestOpts: RequestOptions) => AngularPlugin[] | Promise<AngularPlugin[]>);
}

/** @see BaseApiConstructor */
export interface BaseApiAngularClientConstructor extends PartialExcept<BaseApiAngularClientOptions, 'basePath' | 'httpClient'> {
}

const DEFAULT_OPTIONS = {
  replyPlugins: [new ReviverReply(), new ExceptionReply()],
  angularPlugins: [],
  requestPlugins: [],
  enableTokenization: false,
  disableFallback: false,
  enableParameterSerialization: false
} as const satisfies Omit<BaseApiAngularClientOptions, 'basePath' | 'httpClient'>;

/** Client to process the call to the API using Angular API */
export class ApiAngularClient implements ApiClient {
  /** @inheritdoc */
  public options: BaseApiAngularClientOptions;

  /**
   * Initialize your API Client instance
   * @param options Configuration of the API Client
   */
  constructor(options: BaseApiAngularClientConstructor) {
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
  public async getRequestOptions(requestOptionsParameters: RequestOptionsParameters): Promise<RequestOptions> {
    let opts: RequestOptions = {
      ...requestOptionsParameters,
      headers: new Headers(filterUndefinedValues(requestOptionsParameters.headers)),
      queryParams: filterUndefinedValues(requestOptionsParameters.queryParams)
    };
    if (this.options.requestPlugins) {
      const requestPlugins = typeof this.options.requestPlugins === 'function' ? await this.options.requestPlugins(opts) : this.options.requestPlugins;
      for (const plugin of requestPlugins) {
        opts = await plugin.load({
          logger: this.options.logger,
          apiName: requestOptionsParameters.api?.apiName
        }).transform(opts);
      }
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
  public tokenizeRequestOptions(url: string, queryParameters: { [key: string]: string }, piiParamTokens: { [key: string]: string }, data: any): TokenizedOptions | undefined {
    return this.options.enableTokenization ? tokenizeRequestOptions(url, queryParameters, piiParamTokens, data) : undefined;
  }

  /** @inheritdoc */
  public async processCall(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, revivers?: undefined, operationId?: string): Promise<void>;
  public async processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes, apiName: string, revivers: ReviverType<T> | { [statusCode: number]: ReviverType<T> | undefined },
    operationId?: string): Promise<T>;
  public async processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string,
    revivers?: ReviverType<T> | { [statusCode: number]: ReviverType<T> | undefined }, operationId?: string): Promise<T> {
    let response: HttpResponse<any> | undefined;
    let root: any;
    let exception: Error | undefined;

    const origin = options.headers.get('Origin');

    // Execute call
    try {
      const headers = Object.fromEntries(options.headers.entries());

      const angularPlugins = typeof this.options.angularPlugins === 'function'
        ? await this.options.angularPlugins(options)
        : this.options.angularPlugins;

      const asyncResponse = new Promise<HttpResponse<any>>((resolve, reject) => {
        let data: HttpResponse<any>;
        const metadataSignal = options.metadata?.signal;
        metadataSignal?.throwIfAborted();

        const loadedPlugins: (PluginObservableRunner<HttpResponse<any>, AngularCall>)[] = [];
        loadedPlugins.push(...angularPlugins.map((plugin) => plugin.load({
          angularPlugins: loadedPlugins,
          apiClient: this,
          url,
          apiName,
          requestOptions: options,
          logger: this.options.logger
        })));

        let httpRequest = this.options.httpClient.request(options.method, url, {
          ...options,
          observe: 'response',
          headers
        });

        for (const plugin of loadedPlugins) {
          httpRequest = plugin.transform(httpRequest);
        }

        const subscription = httpRequest.subscribe({
          next: (res) => data = res,
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- subscription forwards the error from the httpRequest to asyncResponse promise
          error: (err) => reject(err),
          complete: () => resolve(data)
        });
        metadataSignal?.throwIfAborted();
        metadataSignal?.addEventListener('abort', () => {
          subscription.unsubscribe();
          reject(
            metadataSignal.reason instanceof Error
              ? metadataSignal.reason
              : new Error(metadataSignal.reason.toString())
          );
        });
      });
      response = await asyncResponse;
      root = response.body;
    } catch (e: any) {
      if (e instanceof CanceledCallError) {
        exception = e;
      } else if (response && !Number.isNaN(response.status)) {
        exception = new RequestFailedError(e.message || 'Fail to Fetch', response.status, undefined, { apiName, operationId, url, origin });
      } else {
        exception = new EmptyResponseError(e.message || 'Fail to Fetch', undefined, { apiName, operationId, url, origin });
      }
    }

    const reviver = getResponseReviver(revivers, response, operationId, { disableFallback: this.options.disableFallback });
    const replyPlugins = this.options.replyPlugins
      ? this.options.replyPlugins.map((plugin) => plugin.load<T>({
        dictionaries: root && root.dictionaries,
        response: response && {
          ...response,
          headers: new Headers(
            response.headers.keys()
              .map((key) => ([key, response.headers.get(key)!] as [string, string]))
          )
        },
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
