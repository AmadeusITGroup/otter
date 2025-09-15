import { GetComponent200Response } from '../../models/base/get-component200-response/index';
import { GetFileComponents200Response } from '../../models/base/get-file-components200-response/index';
import { GetTeamComponents200Response } from '../../models/base/get-team-components200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to ComponentsApi's getComponent function */
export interface ComponentsApiGetComponentRequestData {
  /** The unique identifier of the component. */
  'key': string;
}
/** Parameters object to ComponentsApi's getFileComponents function */
export interface ComponentsApiGetFileComponentsRequestData {
  /** File to list components from. This must be a main file key, not a branch key, as it is not possible to publish from branches. */
  'file_key': string;
}
/** Parameters object to ComponentsApi's getTeamComponents function */
export interface ComponentsApiGetTeamComponentsRequestData {
  /** Id of the team to list components from. */
  'team_id': string;
  /** Number of items to return in a paged list of results. Defaults to 30. */
  'page_size'?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids. */
  'after'?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids. */
  'before'?: number;
}
export class ComponentsApi implements Api {

  /** API name */
  public static readonly apiName = 'ComponentsApi';

  /** @inheritDoc */
  public readonly apiName = ComponentsApi.apiName;

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
   * Get component
   * Get metadata on a component by key.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getComponent(data: ComponentsApiGetComponentRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetComponent200Response> {
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
      basePath = `${this.client.options.basePath}/v1/components/${serializedPathParams['key']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/components/${this.piiParamTokens['key'] || serializedPathParams['key']}`
    } else {
      basePath = `${this.client.options.basePath}/v1/components/${data['key']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/components/${this.piiParamTokens['key'] || data['key']}`;
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

    const ret = this.client.processCall<GetComponent200Response>(url, options, ApiTypes.DEFAULT, ComponentsApi.apiName, undefined, 'getComponent');
    return ret;
  }

  /**
   * Get file components
   * Get a list of published components within a file library.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFileComponents(data: ComponentsApiGetFileComponentsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFileComponents200Response> {
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
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/components`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/components`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/components`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/components`;
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

    const ret = this.client.processCall<GetFileComponents200Response>(url, options, ApiTypes.DEFAULT, ComponentsApi.apiName, undefined, 'getFileComponents');
    return ret;
  }

  /**
   * Get team components
   * Get a paginated list of published components within a team library.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getTeamComponents(data: ComponentsApiGetTeamComponentsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetTeamComponents200Response> {
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
      basePath = `${this.client.options.basePath}/v1/teams/${serializedPathParams['team_id']}/components`
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || serializedPathParams['team_id']}/components`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/teams/${data['team_id']}/components`;
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || data['team_id']}/components`;
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

    const ret = this.client.processCall<GetTeamComponents200Response>(url, options, ApiTypes.DEFAULT, ComponentsApi.apiName, undefined, 'getTeamComponents');
    return ret;
  }

}
