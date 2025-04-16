import { ApiResponse } from '../../models/base/api-response/index';
import { Pet } from '../../models/base/pet/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Enum status used in the PetApi's findPetsByStatus function parameter */
export type PetApiFindPetsByStatusStatusEnum = 'available' | 'pending' | 'sold';

/** Parameters object to PetApi's addPet function */
export interface PetApiAddPetRequestData {
  /** Create a new pet in the store */
  'Pet': Pet;
}
/** Parameters object to PetApi's deletePet function */
export interface PetApiDeletePetRequestData {
  /** Pet id to delete */
  'petId': number;
  /**  */
  'api_key'?: string;
}
/** Parameters object to PetApi's findPetsByStatus function */
export interface PetApiFindPetsByStatusRequestData {
  /** Status values that need to be considered for filter */
  'status'?: PetApiFindPetsByStatusStatusEnum;
}
/** Parameters object to PetApi's findPetsByTags function */
export interface PetApiFindPetsByTagsRequestData {
  /** Tags to filter by */
  'tags'?: string[];
}
/** Parameters object to PetApi's getPetById function */
export interface PetApiGetPetByIdRequestData {
  /** ID of pet to return */
  'petId': number;
}
/** Parameters object to PetApi's updatePet function */
export interface PetApiUpdatePetRequestData {
  /** Update an existent pet in the store */
  'Pet': Pet;
}
/** Parameters object to PetApi's updatePetWithForm function */
export interface PetApiUpdatePetWithFormRequestData {
  /** ID of pet that needs to be updated */
  'petId': number;
  /** Name of pet that needs to be updated */
  'name'?: string;
  /** Status of pet that needs to be updated */
  'status'?: string;
}
/** Parameters object to PetApi's uploadFile function */
export interface PetApiUploadFileRequestData {
  /** ID of pet to update */
  'petId': number;
  /** Additional Metadata */
  'additionalMetadata'?: string;
  /**  */
  'body'?: File;
}
export class PetApi implements Api {

  /** API name */
  public static readonly apiName = 'PetApi';

  /** @inheritDoc */
  public readonly apiName = PetApi.apiName;

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
   * Add a new pet to the store
   * Add a new pet to the store
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async addPet(data: PetApiAddPetRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', 'application/xml' | 'application/json'>): Promise<Pet> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['Pet'] !== 'undefined' ? JSON.stringify(data['Pet']) : '{}';
    } else {
      body = data['Pet'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/pet`;
    const tokenizedUrl = `${this.client.options.basePath}/pet`;
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

    const ret = this.client.processCall<Pet>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'addPet');
    return ret;
  }

  /**
   * Deletes a pet
   * 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deletePet(data: PetApiDeletePetRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<string> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {}),
      'api_key': data['api_key']
    };

    let body: RequestBody = '';

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['petId']);
      const pathParamSerialization = { petId: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/pet/${serializedPathParams['petId']}`
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || serializedPathParams['petId']}`
    } else {
      basePath = `${this.client.options.basePath}/pet/${data['petId']}`;
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || data['petId']}`;
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

    const ret = this.client.processCall<string>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'deletePet');
    return ret;
  }

  /**
   * Finds Pets by status
   * Multiple status values can be provided with comma separated strings
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async findPetsByStatus(data: PetApiFindPetsByStatusRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<Pet[]> {
    data['status'] = data['status'] !== undefined ? data['status'] : 'available';
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['status']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { status: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
    }
    const basePath = `${this.client.options.basePath}/pet/findByStatus`;
    const tokenizedUrl = `${this.client.options.basePath}/pet/findByStatus`;
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

    const ret = this.client.processCall<Pet[]>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'findPetsByStatus');
    return ret;
  }

  /**
   * Finds Pets by tags
   * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async findPetsByTags(data: PetApiFindPetsByTagsRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<Pet[]> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['tags']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { tags: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
    }
    const basePath = `${this.client.options.basePath}/pet/findByTags`;
    const tokenizedUrl = `${this.client.options.basePath}/pet/findByTags`;
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

    const ret = this.client.processCall<Pet[]>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'findPetsByTags');
    return ret;
  }

  /**
   * Find pet by ID
   * Returns a single pet
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getPetById(data: PetApiGetPetByIdRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<Pet> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['petId']);
      const pathParamSerialization = { petId: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/pet/${serializedPathParams['petId']}`
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || serializedPathParams['petId']}`
    } else {
      basePath = `${this.client.options.basePath}/pet/${data['petId']}`;
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || data['petId']}`;
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

    const ret = this.client.processCall<Pet>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'getPetById');
    return ret;
  }

  /**
   * Update an existing pet
   * Update an existing pet by Id
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async updatePet(data: PetApiUpdatePetRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', 'application/xml' | 'application/json'>): Promise<Pet> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['Pet'] !== 'undefined' ? JSON.stringify(data['Pet']) : '{}';
    } else {
      body = data['Pet'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/pet`;
    const tokenizedUrl = `${this.client.options.basePath}/pet`;
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

    const ret = this.client.processCall<Pet>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'updatePet');
    return ret;
  }

  /**
   * Updates a pet in the store with form data
   * 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async updatePetWithForm(data: PetApiUpdatePetWithFormRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['name', 'status']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { name: { explode: true, style: 'form' }, status: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['petId']);
      const pathParamSerialization = { petId: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/pet/${serializedPathParams['petId']}`
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || serializedPathParams['petId']}`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/pet/${data['petId']}`;
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || data['petId']}`;
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

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'updatePetWithForm');
    return ret;
  }

  /**
   * uploads an image
   * 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async uploadFile(data: PetApiUploadFileRequestData, metadata?: RequestMetadata<'application/octet-stream', 'application/json'>): Promise<ApiResponse> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/octet-stream',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['body'] !== 'undefined' ? JSON.stringify(data['body']) : '{}';
    } else {
      body = data['body'] as any;
    }

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['additionalMetadata']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { additionalMetadata: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['petId']);
      const pathParamSerialization = { petId: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/pet/${serializedPathParams['petId']}/uploadImage`
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || serializedPathParams['petId']}/uploadImage`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/pet/${data['petId']}/uploadImage`;
      tokenizedUrl = `${this.client.options.basePath}/pet/${this.piiParamTokens['petId'] || data['petId']}/uploadImage`;
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

    const ret = this.client.processCall<ApiResponse>(url, options, ApiTypes.DEFAULT, PetApi.apiName, undefined, 'uploadFile');
    return ret;
  }

}
