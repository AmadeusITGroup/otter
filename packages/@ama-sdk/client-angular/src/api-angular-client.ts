import type {
  ApiClient,
  ApiTypes,
  BaseApiClientOptions,
  PartialExcept,
  RequestOptions,
  RequestOptionsParameters,
  ReviverType,
  TokenizedOptions
} from '@ama-sdk/core';
import {
  EmptyResponseError,
  ExceptionReply,
  extractQueryParams,
  filterUndefinedValues,
  getResponseReviver,
  prepareUrl,
  processFormData,
  ReviverReply,
  tokenizeRequestOptions
} from '@ama-sdk/core';
import type {
  HttpClient,
  HttpResponse
} from '@angular/common/http';
import type {
  AngularCall,
  AngularPlugin,
  PluginObservableRunner
} from './angular-plugin';

/** @see BaseApiClientOptions */
export interface BaseApiAngularClientOptions extends BaseApiClientOptions {
  /** Angular HTTP Client  */
  httpClient: HttpClient;
  /** List of plugins to apply to the Angular Http call */
  angularPlugins: AngularPlugin[];
}

/** @see BaseApiConstructor */
export interface BaseApiAngularClientConstructor extends PartialExcept<BaseApiAngularClientOptions, 'basePath' | 'httpClient'> {
}

const DEFAULT_OPTIONS: Omit<BaseApiAngularClientOptions, 'basePath' | 'httpClient'> = {
  replyPlugins: [new ReviverReply(), new ExceptionReply()],
  angularPlugins: [],
  requestPlugins: [],
  enableTokenization: false,
  disableFallback: false
};

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

      const asyncResponse = new Promise<HttpResponse<any>>((resolve, reject) => {
        let data: HttpResponse<any>;
        const metadataSignal = options.metadata?.signal;
        metadataSignal?.throwIfAborted();

        const loadedPlugins: (PluginObservableRunner<HttpResponse<any>, AngularCall>)[] = [];
        if (this.options.angularPlugins) {
          loadedPlugins.push(...this.options.angularPlugins.map((plugin) => plugin.load({
            angularPlugins: loadedPlugins,
            apiClient: this,
            url,
            apiName,
            requestOptions: options,
            logger: this.options.logger
          })));
        }

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
      exception = new EmptyResponseError(e.message || 'Fail to Fetch', undefined, { apiName, operationId, url, origin });
    }

    // eslint-disable-next-line no-console -- `console.error` is supposed to be the default value if the `options` argument is not provided, can be removed in Otter v12.
    const reviver = getResponseReviver(revivers, response, operationId, { disableFallback: this.options.disableFallback, log: console.error });
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
