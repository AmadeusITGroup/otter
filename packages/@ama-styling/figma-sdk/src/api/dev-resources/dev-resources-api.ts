import { GetDevResources200Response } from '../../models/base/get-dev-resources200-response/index';
import { PostDevResources200Response } from '../../models/base/post-dev-resources200-response/index';
import { PostDevResourcesRequest } from '../../models/base/post-dev-resources-request/index';
import { PutDevResources200Response } from '../../models/base/put-dev-resources200-response/index';
import { PutDevResourcesRequest } from '../../models/base/put-dev-resources-request/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to DevResourcesApi's deleteDevResource function */
export interface DevResourcesApiDeleteDevResourceRequestData {
  /** The file to delete the dev resource from. This must be a main file key, not a branch key. */
  'file_key': string;
  /** The id of the dev resource to delete. */
  'dev_resource_id': string;
}
/** Parameters object to DevResourcesApi's getDevResources function */
export interface DevResourcesApiGetDevResourcesRequestData {
  /** The file to get the dev resources from. This must be a main file key, not a branch key. */
  'file_key': string;
  /** Comma separated list of nodes that you care about in the document. If specified, only dev resources attached to these nodes will be returned. If not specified, all dev resources in the file will be returned. */
  'node_ids'?: string;
}
/** Parameters object to DevResourcesApi's postDevResources function */
export interface DevResourcesApiPostDevResourcesRequestData {
  /** A list of dev resources that you want to create. */
  'PostDevResourcesRequest': PostDevResourcesRequest;
}
/** Parameters object to DevResourcesApi's putDevResources function */
export interface DevResourcesApiPutDevResourcesRequestData {
  /** A list of dev resources that you want to update. */
  'PutDevResourcesRequest': PutDevResourcesRequest;
}
export class DevResourcesApi implements Api {

  /** API name */
  public static readonly apiName = 'DevResourcesApi';

  /** @inheritDoc */
  public readonly apiName = DevResourcesApi.apiName;

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
   * Delete dev resource
   * Delete a dev resource from a file
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deleteDevResource(data: DevResourcesApiDeleteDevResourceRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<void> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key', 'dev_resource_id']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' }, dev_resource_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/dev_resources/${serializedPathParams['dev_resource_id']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/dev_resources/${this.piiParamTokens['dev_resource_id'] || serializedPathParams['dev_resource_id']}`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/dev_resources/${data['dev_resource_id']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/dev_resources/${this.piiParamTokens['dev_resource_id'] || data['dev_resource_id']}`;
    }
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'DELETE',
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

    const ret = this.client.processCall<void>(url, options, ApiTypes.DEFAULT, DevResourcesApi.apiName, undefined, 'deleteDevResource');
    return ret;
  }

  /**
   * Get dev resources
   * Get dev resources in a file
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getDevResources(data: DevResourcesApiGetDevResourcesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetDevResources200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['node_ids']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { node_ids: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/dev_resources`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/dev_resources`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/dev_resources`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/dev_resources`;
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

    const ret = this.client.processCall<GetDevResources200Response>(url, options, ApiTypes.DEFAULT, DevResourcesApi.apiName, undefined, 'getDevResources');
    return ret;
  }

  /**
   * Create dev resources
   * Bulk create dev resources across multiple files. Dev resources that are successfully created will show up in the links_created array in the response.  If there are any dev resources that cannot be created, you may still get a 200 response. These resources will show up in the errors array. Some reasons a dev resource cannot be created include:  - Resource points to a &#x60;file_key&#x60; that cannot be found. - The node already has the maximum of 10 dev resources. - Another dev resource for the node has the same url.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async postDevResources(data: DevResourcesApiPostDevResourcesRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<PostDevResources200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PostDevResourcesRequest'] !== 'undefined' ? JSON.stringify(data['PostDevResourcesRequest']) : '{}';
    } else {
      body = data['PostDevResourcesRequest'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/v1/dev_resources`;
    const tokenizedUrl = `${this.client.options.basePath}/v1/dev_resources`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'POST',
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

    const ret = this.client.processCall<PostDevResources200Response>(url, options, ApiTypes.DEFAULT, DevResourcesApi.apiName, undefined, 'postDevResources');
    return ret;
  }

  /**
   * Update dev resources
   * Bulk update dev resources across multiple files.  Ids for dev resources that are successfully updated will show up in the &#x60;links_updated&#x60; array in the response.  If there are any dev resources that cannot be updated, you may still get a 200 response. These resources will show up in the &#x60;errors&#x60; array.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async putDevResources(data: DevResourcesApiPutDevResourcesRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<PutDevResources200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PutDevResourcesRequest'] !== 'undefined' ? JSON.stringify(data['PutDevResourcesRequest']) : '{}';
    } else {
      body = data['PutDevResourcesRequest'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/v1/dev_resources`;
    const tokenizedUrl = `${this.client.options.basePath}/v1/dev_resources`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'PUT',
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

    const ret = this.client.processCall<PutDevResources200Response>(url, options, ApiTypes.DEFAULT, DevResourcesApi.apiName, undefined, 'putDevResources');
    return ret;
  }

}
