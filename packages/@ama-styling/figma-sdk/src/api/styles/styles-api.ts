import { GetFileStyles200Response } from '../../models/base/get-file-styles200-response/index';
import { GetStyle200Response } from '../../models/base/get-style200-response/index';
import { GetTeamStyles200Response } from '../../models/base/get-team-styles200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to StylesApi's getFileStyles function */
export interface StylesApiGetFileStylesRequestData {
  /** File to list styles from. This must be a main file key, not a branch key, as it is not possible to publish from branches. */
  'file_key': string;
}
/** Parameters object to StylesApi's getStyle function */
export interface StylesApiGetStyleRequestData {
  /** The unique identifier of the style. */
  'key': string;
}
/** Parameters object to StylesApi's getTeamStyles function */
export interface StylesApiGetTeamStylesRequestData {
  /** Id of the team to list styles from. */
  'team_id': string;
  /** Number of items to return in a paged list of results. Defaults to 30. */
  'page_size'?: number;
  /** Cursor indicating which id after which to start retrieving styles for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids. */
  'after'?: number;
  /** Cursor indicating which id before which to start retrieving styles for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids. */
  'before'?: number;
}
export class StylesApi implements Api {

  /** API name */
  public static readonly apiName = 'StylesApi';

  /** @inheritDoc */
  public readonly apiName = StylesApi.apiName;

  /** Tokens of the parameters containing PII */
  public readonly piiParamTokens: { [key: string]: string } = computePiiParameterTokens([]);

  /** @inheritDoc */
  public client: ApiClient;

  /**
   * Initialize your interface
   *
   * @param apiClient Client used to process call to the API
   */
  constructor(apiClient: ApiClient) {
    this.client = apiClient;
  }

  /**
   * Get file styles
   * Get a list of published styles within a file library.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFileStyles(data: StylesApiGetFileStylesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFileStyles200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/styles`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/styles`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/styles`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/styles`;
    }
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      paramSerializationOptions,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.options.enableParameterSerialization ? this.client.prepareUrlWithQueryParams(options.basePath, options.queryParams) : this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<GetFileStyles200Response>(url, options, ApiTypes.DEFAULT, StylesApi.apiName, undefined, 'getFileStyles');
    return ret;
  }

  /**
   * Get style
   * Get metadata on a style by key.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getStyle(data: StylesApiGetStyleRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetStyle200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['key']);
      const pathParamSerialization = { key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/styles/${serializedPathParams['key']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/styles/${this.piiParamTokens['key'] || serializedPathParams['key']}`
    } else {
      basePath = `${this.client.options.basePath}/v1/styles/${data['key']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/styles/${this.piiParamTokens['key'] || data['key']}`;
    }
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      paramSerializationOptions,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.options.enableParameterSerialization ? this.client.prepareUrlWithQueryParams(options.basePath, options.queryParams) : this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<GetStyle200Response>(url, options, ApiTypes.DEFAULT, StylesApi.apiName, undefined, 'getStyle');
    return ret;
  }

  /**
   * Get team styles
   * Get a paginated list of published styles within a team library.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getTeamStyles(data: StylesApiGetTeamStylesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetTeamStyles200Response> {
    data['page_size'] = data['page_size'] !== undefined ? data['page_size'] : 30;
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['page_size', 'after', 'before']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { page_size: { explode: true, style: 'form' }, after: { explode: true, style: 'form' }, before: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['team_id']);
      const pathParamSerialization = { team_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/teams/${serializedPathParams['team_id']}/styles`
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || serializedPathParams['team_id']}/styles`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/teams/${data['team_id']}/styles`;
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || data['team_id']}/styles`;
    }
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      paramSerializationOptions,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.options.enableParameterSerialization ? this.client.prepareUrlWithQueryParams(options.basePath, options.queryParams) : this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<GetTeamStyles200Response>(url, options, ApiTypes.DEFAULT, StylesApi.apiName, undefined, 'getTeamStyles');
    return ret;
  }

}
