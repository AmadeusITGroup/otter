import { GetLocalVariables200Response } from '../../models/base/get-local-variables200-response/index';
import { GetPublishedVariables200Response } from '../../models/base/get-published-variables200-response/index';
import { PostVariables200Response } from '../../models/base/post-variables200-response/index';
import { PostVariablesRequest } from '../../models/base/post-variables-request/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to VariablesApi's getLocalVariables function */
export interface VariablesApiGetLocalVariablesRequestData {
  /** File to get variables from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
}
/** Parameters object to VariablesApi's getPublishedVariables function */
export interface VariablesApiGetPublishedVariablesRequestData {
  /** File to get variables from. This must be a main file key, not a branch key, as it is not possible to publish from branches. */
  'file_key': string;
}
/** Parameters object to VariablesApi's postVariables function */
export interface VariablesApiPostVariablesRequestData {
  /** File to modify variables in. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /**  */
  'PostVariablesRequest': PostVariablesRequest;
}
export class VariablesApi implements Api {

  /** API name */
  public static readonly apiName = 'VariablesApi';

  /** @inheritDoc */
  public readonly apiName = VariablesApi.apiName;

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
   * Get local variables
   * **This API is available to full members of Enterprise orgs.**  The &#x60;GET /v1/files/:file_key/variables/local&#x60; endpoint lets you enumerate local variables created in the file and remote variables used in the file. Remote variables are referenced by their &#x60;subscribed_id&#x60;.  As a part of the Variables related API additions, the &#x60;GET /v1/files/:file_key&#x60; endpoint now returns a &#x60;boundVariables&#x60; property, containing the &#x60;variableId&#x60; of the bound variable. The &#x60;GET /v1/files/:file_key/variables/local&#x60; endpoint can be used to get the full variable or variable collection object.  Note that &#x60;GET /v1/files/:file_key/variables/published&#x60; does not return modes. Instead, you will need to use the &#x60;GET /v1/files/:file_key/variables/local&#x60; endpoint, in the same file, to examine the mode values.         
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLocalVariables(data: VariablesApiGetLocalVariablesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLocalVariables200Response> {
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
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/variables/local`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/variables/local`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/variables/local`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/variables/local`;
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

    const ret = this.client.processCall<GetLocalVariables200Response>(url, options, ApiTypes.DEFAULT, VariablesApi.apiName, undefined, 'getLocalVariables');
    return ret;
  }

  /**
   * Get published variables
   * **This API is available to full members of Enterprise orgs.**  The &#x60;GET /v1/files/:file_key/variables/published&#x60; endpoint returns the variables that are published from the given file.  The response for this endpoint contains some key differences compared to the &#x60;GET /v1/files/:file_key/variables/local&#x60; endpoint:  - Each variable and variable collection contains a &#x60;subscribed_id&#x60;. - Modes are omitted for published variable collections  Published variables have two ids: an id that is assigned in the file where it is created (&#x60;id&#x60;), and an id that is used by subscribing files (&#x60;subscribed_id&#x60;). The &#x60;id&#x60; and &#x60;key&#x60; are stable over the lifetime of the variable. The &#x60;subscribed_id&#x60; changes every time the variable is modified and published. The same is true for variable collections.  The &#x60;updatedAt&#x60; fields are ISO 8601 timestamps that indicate the last time that a change to a variable was published. For variable collections, this timestamp will change any time a variable in the collection is changed.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getPublishedVariables(data: VariablesApiGetPublishedVariablesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetPublishedVariables200Response> {
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
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/variables/published`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/variables/published`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/variables/published`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/variables/published`;
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

    const ret = this.client.processCall<GetPublishedVariables200Response>(url, options, ApiTypes.DEFAULT, VariablesApi.apiName, undefined, 'getPublishedVariables');
    return ret;
  }

  /**
   * Create/modify/delete variables
   * **This API is available to full members of Enterprise orgs with Editor seats.**  The &#x60;POST /v1/files/:file_key/variables&#x60; endpoint lets you bulk create, update, and delete variables and variable collections.  The request body supports the following 4 top-level arrays. Changes from these arrays will be applied in the below order, and within each array, by array order.  - **variableCollections**: For creating, updating, and deleting variable collections - **variableModes**: For creating, updating, and deleting modes within variable collections   - Each collection can have a maximum of 40 modes   - Mode names cannot be longer than 40 characters - **variables**: For creating, updating, and deleting variables   - Each collection can have a maximum of 5000 variables   - Variable names must be unique within a collection and cannot contain certain special characters such as &#x60;.{}&#x60; - **variableModeValues**: For setting a variable value under a specific mode.   - When setting aliases, a variable cannot be aliased to itself or form an alias cycle  Temporary ids can be used to reference an object later in the same POST request body. They can be used at create time in the &#x60;id&#x60; property of variable collections, modes, variables, and in the &#x60;initialModeId&#x60; property of variable collections. They are scoped to a single request body, and must be unique within the body. The mapping of temporary ids to real ids is returned in the response.  This endpoint has the following key behaviors:  - The request body must be 4MB or less. - Must include an &#x60;action&#x60; property for collections, modes, and variables to tell the API whether to create, update, or delete the object. - When creating a collection, mode, or variable, you can include a temporary &#x60;id&#x60; that can be referenced in dependent objects in the same request. For example, you can create a new collection with the id &#x60;\&quot;my_new_collection\&quot;&#x60;. You can then set &#x60;variableCollectionId&#x60; to &#x60;\&quot;my_new_collection\&quot;&#x60; in new modes or variables. Temporary ids must be unique in the request body. - New collections always come with one mode. You can reference this mode by setting &#x60;initialModeId&#x60; to a temporary id in the request body. This is useful if you want to set values for variables in the mode in the &#x60;variableModeValues&#x60; array.   - The &#x60;tempIdToRealId&#x60; array returns a mapping of the temporary ids in the request, to the real ids of the newly created objects. - When adding new modes or variables, default variable values will be applied, consistent with what happens in the UI. - Everything to be created, updated, and deleted in the request body is treated as one atomic operation. If there is any validation failure, you will get a 400 status code response, and no changes will be persisted. - You will not be able to update remote variables or variable collections. You can only update variables in the file where they were originally created.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async postVariables(data: VariablesApiPostVariablesRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<PostVariables200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PostVariablesRequest'] !== 'undefined' ? JSON.stringify(data['PostVariablesRequest']) : '{}';
    } else {
      body = data['PostVariablesRequest'] as any;
    }

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
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/variables`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/variables`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/variables`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/variables`;
    }
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

    const ret = this.client.processCall<PostVariables200Response>(url, options, ApiTypes.DEFAULT, VariablesApi.apiName, undefined, 'postVariables');
    return ret;
  }

}
