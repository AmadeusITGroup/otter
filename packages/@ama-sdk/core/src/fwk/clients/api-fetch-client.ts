import {
  FetchCall,
  FetchPlugin,
  PluginAsyncRunner,
  PluginAsyncStarter,
  RequestBody,
  RequestMetadata,
  RequestOptions,
  TokenizedOptions
} from '../../plugins/core/index';
import { ExceptionReply } from '../../plugins/exception';
import { ReviverReply } from '../../plugins/reviver';
import { ApiTypes } from '../api';
import { extractQueryParams, filterUndefinedValues, prepareUrl, processFormData, tokenizeRequestOptions } from '../api.helpers';
import type { PartialExcept } from '../api.interface';
import { ApiClient } from '../core/api-client';
import { BaseApiClientOptions } from '../core/base-api-constructor';
import { CanceledCallError, EmptyResponseError, ResponseJSONParseError } from '../errors';
import { ReviverType } from '../Reviver';

/** @see BaseApiClientOptions */
export interface BaseApiFetchClientOptions extends BaseApiClientOptions {
  /** List of plugins to apply to the fetch call */
  fetchPlugins: FetchPlugin[];
}

/** @see BaseApiConstructor */
export interface BaseApiFetchClientConstructor extends PartialExcept<BaseApiFetchClientOptions, 'basePath'> {
}

const DEFAULT_OPTIONS: Omit<BaseApiFetchClientOptions, 'basePath'> = {
  replyPlugins: [new ReviverReply(), new ExceptionReply()],
  fetchPlugins: [],
  requestPlugins: [],
  enableTokenization: false
};

/** Client to process the call to the API using Fetch API */
export class ApiFetchClient implements ApiClient {

  /** @inheritdoc */
  public options: BaseApiFetchClientOptions;

  /**
   * Initialize your API Client instance
   *
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
  public async prepareOptions(url: string, method: string, queryParams: { [key: string]: string | undefined }, headers: { [key: string]: string | undefined }, body?: RequestBody,
    tokenizedOptions?: TokenizedOptions, metadata?: RequestMetadata) {
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
        opts = await plugin.load().transform(opts);
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
  public async processCall(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, reviver?: undefined, operationId?: string): Promise<void>;
  public async processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes, apiName: string, reviver: ReviverType<T>, operationId?: string): Promise<T>;
  public async processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, reviver?: ReviverType<T> | undefined, operationId?: string): Promise<T> {

    let response: Response | undefined;
    let asyncResponse: Promise<Response>;
    let root: any | undefined;
    let body: string | undefined;
    let exception: Error | undefined;

    // Execute call
    try {

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
      if (controller) {
        options.signal = controller.signal;
      }
      const loadedPlugins: (PluginAsyncRunner<Response, FetchCall> & PluginAsyncStarter)[] = [];
      if (this.options.fetchPlugins) {
        loadedPlugins.push(...this.options.fetchPlugins.map((plugin) => plugin.load({ url, options, fetchPlugins: loadedPlugins, controller, apiClient: this })));
      }

      const canStart = await Promise.all(loadedPlugins.map((plugin) => !plugin.canStart || plugin.canStart()));
      const isCanceledBy = canStart.indexOf(false);
      if (isCanceledBy >= 0) {
        // One of the fetch plugins cancelled the execution of the call
        asyncResponse = Promise.reject(new CanceledCallError(`Is canceled by the plugin ${isCanceledBy}`, isCanceledBy, this.options.fetchPlugins[isCanceledBy], { apiName, operationId, url }));
      } else {
        asyncResponse = fetch(url, options);
      }

      for (const plugin of loadedPlugins) {
        asyncResponse = plugin.transform(asyncResponse);
      }

      response = await asyncResponse;

      body = await response.text();
    } catch (e: any) {
      if (e instanceof CanceledCallError) {
        exception = e;
      } else {
        exception = new EmptyResponseError(e.message || 'Fail to Fetch', undefined, { apiName, operationId, url });
      }
    }

    try {
      root = body ? JSON.parse(body) : undefined;
    } catch (e: any) {
      exception = new ResponseJSONParseError(e.message || 'Fail to parse response body', response && response.status || 0, body, { apiName, operationId, url });
    }

    const replyPlugins = this.options.replyPlugins ?
      this.options.replyPlugins.map((plugin) => plugin.load<T>({
        dictionaries: root && root.dictionaries,
        response,
        reviver,
        apiType,
        apiName,
        exception,
        operationId,
        url
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
