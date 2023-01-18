import {Inject, Injectable} from '@angular/core';

import {defaultRequestParametersConfig, RequestParametersConfig, StorageStrategy} from './request-parameters.config';

import {REQUEST_PARAMETERS_CONFIG_TOKEN} from './request-parameters.token';

export type ParamsList = 'query' | 'post';

export type ParamsType = {[k in ParamsList]: {[key: string]: string}};

/**
 * Partial configuration for RequestParameters Service
 */
export interface PartialRequestParametersConfig extends Partial<RequestParametersConfig> {}

/**
 * Service used to store the request parameters of your requests so that subsequent calls or refresh the page will preserve
 * them.
 */
@Injectable()
export class RequestParametersService implements ParamsType {
  private _query: {[key: string]: string} = {};
  private _post: {[key: string]: string} = {};

  private config: RequestParametersConfig;

  constructor(@Inject(REQUEST_PARAMETERS_CONFIG_TOKEN) config: PartialRequestParametersConfig) {
    this.config = defaultRequestParametersConfig;
    Object.keys(config)
      .filter((key) => config[key] !== undefined)
      .forEach((key) => this.config[key] = config[key]);

    this.setParameters('query', JSON.parse(this.config.queryParamsValue));
    this.setParameters('post', JSON.parse(this.config.postParamsValue));
  }

  /**
   * Depending on the strategy, set the internal values for the parameters.
   * See StorageStrategy for more info.
   *
   * @param key
   * @param value
   */
  private setParameters(key: ParamsList, value: {[key: string]: string}) {
    const privateKey = `_${key}`;
    if (!this.config.storage) {
      // No storage is available , cannot set items
      return;
    }
    switch (this.config.strategy) {
      case StorageStrategy.Rehydrate: {
        if (!this.config.storage.getItem(privateKey)) {
          this[privateKey] = value;
          this.config.storage.setItem(privateKey, JSON.stringify(value));
          break;
        }
        this[privateKey] = JSON.parse(this.config.storage.getItem(privateKey) || '{}');
        break;
      }
      case StorageStrategy.Replace: {
        this[privateKey] = value;
        this.config.storage.setItem(privateKey, JSON.stringify(value));
        break;
      }
      case StorageStrategy.Merge: {
        const storageData = Object.assign(JSON.parse(this.config.storage.getItem(privateKey) || '{}'), value);
        this[privateKey] = storageData;
        this.config.storage.setItem(privateKey, JSON.stringify(storageData));
        break;
      }
      case StorageStrategy.ReplaceIfNotEmpty: {
        if (Object.keys(value).length > 0) {
          this[privateKey] = value;
          this.config.storage.setItem(privateKey, JSON.stringify(value));
          break;
        }
        this[privateKey] = JSON.parse(this.config.storage.getItem(privateKey) || '{}');
        break;
      }
    }
  }

  /**
   * Get all the query parameters in a map.
   */
  public get query() {
    return this._query;
  }

  /**
   * Get all the post parameters in a map.
   */
  public get post() {
    return this._post;
  }

  /**
   * Get a specific query parameter value, given the key.
   *
   * @param key
   */
  public getQueryParameter(key: string): string | undefined {
    return this._query[key];
  }

  /**
   * Get a specific query parameter value as boolean, given the key.
   *
   * @param key
   */
  public getQueryParameterAsBoolean(key: string): boolean | undefined {
    const queryParameter: string | undefined = this.getQueryParameter(key);
    return queryParameter ? queryParameter.toLowerCase() === 'true' : undefined;
  }

  /**
   * Get a specific post parameter value, given the key.
   *
   * @param key
   */
  public getPostParameter(key: string): string | undefined {
    return this._post[key];
  }

  /**
   * Get a specific post parameter value as boolean, given the key.
   *
   * @param key
   */
  public getPostParameterAsBoolean(key: string): boolean | undefined {
    const postParameter: string | undefined = this.getPostParameter(key);
    return postParameter ? postParameter.toLowerCase() === 'true' : undefined;
  }

  /**
   * Get a specific parameter value, given the key.
   *
   * @param key
   */
  public getParameter(key: string): string | undefined {
    return this._query[key] || this._post[key];
  }

  /**
   * Get a specific parameter value as boolean, given the key.
   *
   * @param key
   */
  public getParameterAsBoolean(key: string): boolean | undefined {
    const parameter: string | undefined = this.getParameter(key);
    return parameter ? parameter.toLowerCase() === 'true' : undefined;
  }

  /**
   * Clear GET parameters from the storage
   *
   * @param paramsToClear the list on key that you want to clear in get parameters
   */
  public clearQueryParameters(paramsToClear?: string[]) {
    const newQuery = (paramsToClear ? Object.keys(this._query).filter((key) => paramsToClear.indexOf(key) === -1) : [])
      .reduce<{[k: string]: string}>((acc, key) => {
        acc[key] = this._query[key];
        return acc;
      }, {});
    if (this.config.storage) {
      this.config.storage.setItem('_query', JSON.stringify(newQuery));
    }
    this._query = newQuery;
  }

  /**
   * Clear POST parameters from the storage
   *
   * @param paramsToClear the list on key that you want to clean in post parameters
   */
  public clearPostParameters(paramsToClear?: string[]) {
    const newPost = (paramsToClear ? Object.keys(this._post).filter((key) => paramsToClear.indexOf(key) === -1) : [])
      .reduce<{[k: string]: string}>((acc, key) => {
        acc[key] = this._post[key];
        return acc;
      }, {});
    if (this.config.storage) {
      this.config.storage.setItem('_post', JSON.stringify(newPost));
    }
    this._post = newPost;
  }

  /**
   * Get all the parameters in a map.
   *
   * @param priority the parameter to be given priority in case same key is in get and post params.
   */
  public getParams(priority: ParamsList = 'query') {
    return priority === 'query' ? { ...this._post, ...this._query } : { ...this._query, ...this._post };
  }

  /**
   * Filter Parameters(both Query/POST) from the storage
   *
   * @param paramstoFilter the list on key that you want to filter from parameters
   * @param priority the priorty of the parameter type(POST/Query)
   */
  public getFilteredParameters(paramstoFilter?: string[], priority: ParamsList = 'query') {
    const params = this.getParams(priority);
    if (!paramstoFilter) {
      return params;
    }
    return Object.keys(params)
      .filter((key) => paramstoFilter.indexOf(key) === -1)
      .reduce<{ [k: string]: string }>((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
  }
}
