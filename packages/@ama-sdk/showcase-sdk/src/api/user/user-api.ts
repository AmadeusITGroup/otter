import { User } from '../../models/base/user/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to UserApi's createUser function */
export interface UserApiCreateUserRequestData {
  /** Created user object */
  'User'?: User;
}
/** Parameters object to UserApi's createUsersWithListInput function */
export interface UserApiCreateUsersWithListInputRequestData {
  /** List of Users */
  'User'?: User[];
}
/** Parameters object to UserApi's deleteUser function */
export interface UserApiDeleteUserRequestData {
  /** The name that needs to be deleted */
  'username': string;
}
/** Parameters object to UserApi's getUserByName function */
export interface UserApiGetUserByNameRequestData {
  /** The name that needs to be fetched. Use user1 for testing.  */
  'username': string;
}
/** Parameters object to UserApi's loginUser function */
export interface UserApiLoginUserRequestData {
  /** The user name for login */
  'username'?: string;
  /** The password for login in clear text */
  'password'?: string;
}
/** Parameters object to UserApi's logoutUser function */
export interface UserApiLogoutUserRequestData {
}
/** Parameters object to UserApi's updateUser function */
export interface UserApiUpdateUserRequestData {
  /** name that needs to be updated */
  'username': string;
  /** Update an existent user in the store */
  'User'?: User;
}
export class UserApi implements Api {

  /** API name */
  public static readonly apiName = 'UserApi';

  /** @inheritDoc */
  public readonly apiName = UserApi.apiName;

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
   * Create user
   * This can only be done by the logged in user.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async createUser(data: UserApiCreateUserRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', 'application/json' | 'application/xml'>): Promise<never> {
    const queryParams = this.client.extractQueryParams<UserApiCreateUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data['User'] ? JSON.stringify(data['User']) : '{}';
    } else {
      body = data['User'] as any;
    }
    const basePath = `${this.client.options.basePath}/user`;
    const tokenizedUrl = `${this.client.options.basePath}/user`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'POST',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'createUser');
    return ret;
  }

  /**
   * Creates list of users with given input array
   * Creates list of users with given input array
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async createUsersWithListInput(data: UserApiCreateUsersWithListInputRequestData, metadata?: RequestMetadata<'application/json', 'application/xml' | 'application/json'>): Promise<User> {
    const queryParams = this.client.extractQueryParams<UserApiCreateUsersWithListInputRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data['User'] ? JSON.stringify(data['User']) : '[]';
    } else {
      body = data['User'] as any;
    }
    const basePath = `${this.client.options.basePath}/user/createWithList`;
    const tokenizedUrl = `${this.client.options.basePath}/user/createWithList`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'POST',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<User>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'createUsersWithListInput');
    return ret;
  }

  /**
   * Delete user
   * This can only be done by the logged in user.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deleteUser(data: UserApiDeleteUserRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
    const queryParams = this.client.extractQueryParams<UserApiDeleteUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    const basePath = `${this.client.options.basePath}/user/${data['username']}`;
    const tokenizedUrl = `${this.client.options.basePath}/user/${this.piiParamTokens['username'] || data['username']}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'DELETE',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'deleteUser');
    return ret;
  }

  /**
   * Get user by user name
   * 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getUserByName(data: UserApiGetUserByNameRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<User> {
    const queryParams = this.client.extractQueryParams<UserApiGetUserByNameRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    const basePath = `${this.client.options.basePath}/user/${data['username']}`;
    const tokenizedUrl = `${this.client.options.basePath}/user/${this.piiParamTokens['username'] || data['username']}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<User>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'getUserByName');
    return ret;
  }

  /**
   * Logs user into the system
   * 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async loginUser(data: UserApiLoginUserRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<string> {
    const queryParams = this.client.extractQueryParams<UserApiLoginUserRequestData>(data, ['username', 'password']);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    const basePath = `${this.client.options.basePath}/user/login`;
    const tokenizedUrl = `${this.client.options.basePath}/user/login`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<string>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'loginUser');
    return ret;
  }

  /**
   * Logs out current logged in user session
   * 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async logoutUser(data: UserApiLogoutUserRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
    const queryParams = this.client.extractQueryParams<UserApiLogoutUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    const basePath = `${this.client.options.basePath}/user/logout`;
    const tokenizedUrl = `${this.client.options.basePath}/user/logout`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'logoutUser');
    return ret;
  }

  /**
   * Update user
   * This can only be done by the logged in user.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async updateUser(data: UserApiUpdateUserRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', string>): Promise<never> {
    const queryParams = this.client.extractQueryParams<UserApiUpdateUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data['User'] ? JSON.stringify(data['User']) : '{}';
    } else {
      body = data['User'] as any;
    }
    const basePath = `${this.client.options.basePath}/user/${data['username']}`;
    const tokenizedUrl = `${this.client.options.basePath}/user/${this.piiParamTokens['username'] || data['username']}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'PUT',
      basePath,
      queryParams,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'updateUser');
    return ret;
  }

}
