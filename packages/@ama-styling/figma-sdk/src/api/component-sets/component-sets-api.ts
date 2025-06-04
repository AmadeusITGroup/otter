import { GetComponentSet200Response } from '../../models/base/get-component-set200-response/index';
import { GetFileComponentSets200Response } from '../../models/base/get-file-component-sets200-response/index';
import { GetTeamComponentSets200Response } from '../../models/base/get-team-component-sets200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to ComponentSetsApi's getComponentSet function */
export interface ComponentSetsApiGetComponentSetRequestData {
  /** The unique identifier of the component set. */
  'key': string;
}
/** Parameters object to ComponentSetsApi's getFileComponentSets function */
export interface ComponentSetsApiGetFileComponentSetsRequestData {
  /** File to list component sets from. This must be a main file key, not a branch key, as it is not possible to publish from branches. */
  'file_key': string;
}
/** Parameters object to ComponentSetsApi's getTeamComponentSets function */
export interface ComponentSetsApiGetTeamComponentSetsRequestData {
  /** Id of the team to list component sets from. */
  'team_id': string;
  /** Number of items to return in a paged list of results. Defaults to 30. */
  'page_size'?: number;
  /** Cursor indicating which id after which to start retrieving component sets for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids. */
  'after'?: number;
  /** Cursor indicating which id before which to start retrieving component sets for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids. */
  'before'?: number;
}
export class ComponentSetsApi implements Api {

  /** API name */
  public static readonly apiName = 'ComponentSetsApi';

  /** @inheritDoc */
  public readonly apiName = ComponentSetsApi.apiName;

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
   * Get component set
   * Get metadata on a published component set by key.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getComponentSet(data: ComponentSetsApiGetComponentSetRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetComponentSet200Response> {
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
      basePath = `${this.client.options.basePath}/v1/component_sets/${serializedPathParams['key']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/component_sets/${this.piiParamTokens['key'] || serializedPathParams['key']}`
    } else {
      basePath = `${this.client.options.basePath}/v1/component_sets/${data['key']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/component_sets/${this.piiParamTokens['key'] || data['key']}`;
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

    const ret = this.client.processCall<GetComponentSet200Response>(url, options, ApiTypes.DEFAULT, ComponentSetsApi.apiName, undefined, 'getComponentSet');
    return ret;
  }

  /**
   * Get file component sets
   * Get a list of published component sets within a file library.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFileComponentSets(data: ComponentSetsApiGetFileComponentSetsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFileComponentSets200Response> {
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
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/component_sets`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/component_sets`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/component_sets`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/component_sets`;
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

    const ret = this.client.processCall<GetFileComponentSets200Response>(url, options, ApiTypes.DEFAULT, ComponentSetsApi.apiName, undefined, 'getFileComponentSets');
    return ret;
  }

  /**
   * Get team component sets
   * Get a paginated list of published component sets within a team library.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getTeamComponentSets(data: ComponentSetsApiGetTeamComponentSetsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetTeamComponentSets200Response> {
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
      basePath = `${this.client.options.basePath}/v1/teams/${serializedPathParams['team_id']}/component_sets`
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || serializedPathParams['team_id']}/component_sets`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/teams/${data['team_id']}/component_sets`;
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || data['team_id']}/component_sets`;
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

    const ret = this.client.processCall<GetTeamComponentSets200Response>(url, options, ApiTypes.DEFAULT, ComponentSetsApi.apiName, undefined, 'getTeamComponentSets');
    return ret;
  }

}
