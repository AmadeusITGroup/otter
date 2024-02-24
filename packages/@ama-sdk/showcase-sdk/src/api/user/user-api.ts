import { User } from '../../models/base/user/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, RequestBody, RequestMetadata } from '@ama-sdk/core';

export interface CreateUserRequestData {
  /** Created user object */
  'User'?: User;
}
export interface CreateUsersWithListInputRequestData {
  /** List of Users */
  'User'?: User[];
}
export interface DeleteUserRequestData {
  /** The name that needs to be deleted */
  'username': string;
}
export interface GetUserByNameRequestData {
  /** The name that needs to be fetched. Use user1 for testing.  */
  'username': string;
}
export interface LoginUserRequestData {
  /** The user name for login */
  'username'?: string;
  /** The password for login in clear text */
  'password'?: string;
}
export interface LogoutUserRequestData {
}
export interface UpdateUserRequestData {
  /** name that needs to be updated */
  'username': string;
  /** Update an existent user in the store */
  'User'?: User;
}
/**
 * @Deprecated, please use CreateUserRequestData
 */
export interface CreateUser extends CreateUserRequestData {}

/**
 * @Deprecated, please use CreateUsersWithListInputRequestData
 */
export interface CreateUsersWithListInput extends CreateUsersWithListInputRequestData {}

/**
 * @Deprecated, please use DeleteUserRequestData
 */
export interface DeleteUser extends DeleteUserRequestData {}

/**
 * @Deprecated, please use GetUserByNameRequestData
 */
export interface GetUserByName extends GetUserByNameRequestData {}

/**
 * @Deprecated, please use LoginUserRequestData
 */
export interface LoginUser extends LoginUserRequestData {}

/**
 * @Deprecated, please use LogoutUserRequestData
 */
export interface LogoutUser extends LogoutUserRequestData {}

/**
 * @Deprecated, please use UpdateUserRequestData
 */
export interface UpdateUser extends UpdateUserRequestData {}

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
   * @params apiClient Client used to process call to the API
   */
  constructor(apiClient: ApiClient) {
    this.client = apiClient;
  }

  /**
   * Create user
   * This can only be done by the logged in user.
   * @param data Data to provide to the API call
   */
  public async createUser(data: CreateUserRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', 'application/json' | 'application/xml'>): Promise<never> {
    const getParams = this.client.extractQueryParams<CreateUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data.User ? JSON.stringify(data.User) : '{}';
    } else {
      body = data.User as any;
    }
    const basePathUrl = `${this.client.options.basePath}/user`;
    const tokenizedUrl = `${this.client.options.basePath}/user`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'POST', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'createUser');
    return ret;
  }

  /**
   * Creates list of users with given input array
   * Creates list of users with given input array
   * @param data Data to provide to the API call
   */
  public async createUsersWithListInput(data: CreateUsersWithListInputRequestData, metadata?: RequestMetadata<'application/json', 'application/xml' | 'application/json'>): Promise<User> {
    const getParams = this.client.extractQueryParams<CreateUsersWithListInputRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data.User ? JSON.stringify(data.User) : '[]';
    } else {
      body = data.User as any;
    }
    const basePathUrl = `${this.client.options.basePath}/user/createWithList`;
    const tokenizedUrl = `${this.client.options.basePath}/user/createWithList`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'POST', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<User>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'createUsersWithListInput');
    return ret;
  }

  /**
   * Delete user
   * This can only be done by the logged in user.
   * @param data Data to provide to the API call
   */
  public async deleteUser(data: DeleteUserRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
    const getParams = this.client.extractQueryParams<DeleteUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/user/${data.username}`;
    const tokenizedUrl = `${this.client.options.basePath}/user/${this.piiParamTokens.username || data.username}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'DELETE', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'deleteUser');
    return ret;
  }

  /**
   * Get user by user name
   *
   * @param data Data to provide to the API call
   */
  public async getUserByName(data: GetUserByNameRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<User> {
    const getParams = this.client.extractQueryParams<GetUserByNameRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/user/${data.username}`;
    const tokenizedUrl = `${this.client.options.basePath}/user/${this.piiParamTokens.username || data.username}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'GET', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<User>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'getUserByName');
    return ret;
  }

  /**
   * Logs user into the system
   *
   * @param data Data to provide to the API call
   */
  public async loginUser(data: LoginUserRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<string> {
    const getParams = this.client.extractQueryParams<LoginUserRequestData>(data, ['username', 'password']);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/user/login`;
    const tokenizedUrl = `${this.client.options.basePath}/user/login`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'GET', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<string>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'loginUser');
    return ret;
  }

  /**
   * Logs out current logged in user session
   *
   * @param data Data to provide to the API call
   */
  public async logoutUser(data: LogoutUserRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
    const getParams = this.client.extractQueryParams<LogoutUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/user/logout`;
    const tokenizedUrl = `${this.client.options.basePath}/user/logout`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'GET', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'logoutUser');
    return ret;
  }

  /**
   * Update user
   * This can only be done by the logged in user.
   * @param data Data to provide to the API call
   */
  public async updateUser(data: UpdateUserRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', string>): Promise<never> {
    const getParams = this.client.extractQueryParams<UpdateUserRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data.User ? JSON.stringify(data.User) : '{}';
    } else {
      body = data.User as any;
    }
    const basePathUrl = `${this.client.options.basePath}/user/${data.username}`;
    const tokenizedUrl = `${this.client.options.basePath}/user/${this.piiParamTokens.username || data.username}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'PUT', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, UserApi.apiName, undefined, 'updateUser');
    return ret;
  }

}
