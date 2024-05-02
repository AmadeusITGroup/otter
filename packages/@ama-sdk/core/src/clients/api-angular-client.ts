import type { HttpClient, HttpResponse } from '@angular/common/http';
import { RequestBody, RequestMetadata, RequestOptions, TokenizedOptions } from '../plugins/core/index';
import { ExceptionReply } from '../plugins/exception';
import { ReviverReply } from '../plugins/reviver';
import { ApiTypes } from '../fwk/api';
import { extractQueryParams, filterUndefinedValues, getResponseReviver, prepareUrl, processFormData, tokenizeRequestOptions } from '../fwk/api.helpers';
import type { PartialExcept } from '../fwk/api.interface';
import { ApiClient } from '../fwk/core/api-client';
import { BaseApiClientOptions } from '../fwk/core/base-api-constructor';
import { EmptyResponseError } from '../fwk/errors';
import { ReviverType } from '../fwk/Reviver';

/** @see BaseApiClientOptions */
export interface BaseApiAngularClientOptions extends BaseApiClientOptions {
  httpClient: HttpClient;
}

/** @see BaseApiConstructor */
export interface BaseApiAngularClientConstructor extends PartialExcept<BaseApiAngularClientOptions, 'basePath' | 'httpClient'> {
}

const DEFAULT_OPTIONS: Omit<BaseApiAngularClientOptions, 'basePath' | 'httpClient'> = {
  replyPlugins: [new ReviverReply(), new ExceptionReply()],
  // AngularPlugins: [],
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
  public async prepareOptions(url: string, method: string, queryParams: { [key: string]: string | undefined }, headers: { [key: string]: string | undefined }, body?: RequestBody | undefined,
    tokenizedOptions?: TokenizedOptions | undefined, metadata?: RequestMetadata<string, string> | undefined): Promise<RequestOptions> {
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
        opts = await plugin.load({logger: this.options.logger}).transform(opts);
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
    revivers?: ReviverType<T> | undefined | { [statusCode: number]: ReviverType<T> | undefined }, operationId?: string): Promise<T> {

    let response: HttpResponse<any> | undefined;
    let root: any;
    let exception: Error | undefined;

    const origin = options.headers.get('Origin');

    // Execute call
    try {
      const headers = Object.fromEntries(options.headers.entries());

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
      if (controller) {
        options.signal = controller.signal;
      }
      const asyncResponse = new Promise<HttpResponse<any>>((resolve, reject) => {
        let data: HttpResponse<any>;
        this.options.httpClient.request(options.method, url, {
          ...options,
          observe: 'response',
          headers
        }).subscribe({
          next: (res) => data = res,
          error: (err) => reject(err),
          complete: () => resolve(data)
        });
      });
      response = await asyncResponse;
      root = response.body;
    } catch (e: any) {
      exception = new EmptyResponseError(e.message || 'Fail to Fetch', undefined, { apiName, operationId, url, origin });
    }

    // eslint-disable-next-line no-console
    const reviver = getResponseReviver(revivers, response, operationId, { disableFallback: this.options.disableFallback, log: console.error });
    const replyPlugins = this.options.replyPlugins ?
      this.options.replyPlugins.map((plugin) => plugin.load<T>({
        dictionaries: root && root.dictionaries,
        response: response && {
          ...response,
          headers: new Headers(
            response.headers.keys()
              .map((key) => ([key, response!.headers.get(key)!] as [string, string]))
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
      })) : [];

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
