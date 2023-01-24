/* eslint-disable no-redeclare */
/* eslint-disable camelcase, @typescript-eslint/naming-convention */

import { Api, ApiClient, ApiTypes } from '../../fwk/index';

/** Token name */
export type TypeEnum = 'amadeusOAuth2Token';
/** Token type */
export type TokenTypeEnum = 'Bearer';
/** Token state */
export type StateEnum = 'approved' | 'revoked' | 'expired';
/** Error returned */
export type ErrorEnum = 'invalid_request' | 'invalid_client' | 'invalid_grant' | 'unauthorized_client' | 'unsupported_grant_type' | 'invalid_scope';

/** Object to provide when calling the gateway api */
export interface BodyToProvide {
  /** The client identifier */
  client_id: string;
  /** The client credentials */
  client_secret: string;
  /** The type of given grantType in order to generate a valid access token. The only possible value is \"client_credentials\" */
  grant_type: 'client_credentials';
  /** The office ID the access token will be granted to */
  guest_office_id: string | undefined;
}

/** Gateway api response object */
export interface Response {
  /** Type of the generated access token, e.g. \"amadeusOAuth2Token\" (additional information, not in the RFC) */
  type?: TypeEnum;
  /** The email of the application owner (additional information, not in the RFC) */
  username?: string;
  /** The display name of the application (additional information, not in the RFC) */
  application_name?: string;
  /** The type of the generated access token (ie Bearer, REQUIRED in the RFC 6749) */
  token_type: TokenTypeEnum;
  /** The application client_id (additional information, not in the RFC) */
  client_id?: string;
  /** The access token (REQUIRED in the RFC 6749) */
  access_token: string;
  /** The time in seconds left before the access token expiration (RECOMMENDED in the RFC 6749) */
  expires_in?: number;
  /** The status of the related access token, e.g. \"approved\", \"revoked\", \"expired\" (additional information, not in the RFC) */
  state?: StateEnum;
  /** OAuth 2.0 scopes provide a way to limit the amount of access that is granted to an access token (OPTIONAL in the RFC 6749) */
  scope?: string;
}

/** Error returned by gateway api */
export interface Error {
  /** Error code in integer format corresponding to a defined canned message */
  code?: number;
  /** The title of the error */
  title?: string;
  /** A detailed message of the current error (RECOMMENDED in the RFC) */
  error_description?: string;
  /** The error according to the RFC standards (REQUIRED in the RFC) */
  error: ErrorEnum;
}

/** The identifier for the acces token */
export interface GetAccessTokenInfo {
  /** The access token for which information need to be retrieved */
  'access_token': string;
}

/** Gateway post body request */
export interface PostAccessToken {
  /** The body to provide to get a valid access token */
  'bodyToProvide': BodyToProvide;
}

export function reviveResponse(data: undefined, dictionaries?: any): undefined;
export function reviveResponse(data: Response, dictionaries?: any): Response;
export function reviveResponse(data: any, dictionaries?: any): Response | undefined;
export function reviveResponse<T extends Response>(data: T, dictionaries?: any): T;
export function reviveResponse<T extends Response>(data: any, dictionaries?: any): T | undefined;
/**
 * Function to revive the data object received from gateway API
 *
 * @param data
 * @param _dictionaries
 */
export function reviveResponse<T extends Response = Response>(data: any, _dictionaries?: any): T | undefined {
  if (!data) { return; }
  return data as T;
}

/** Class which exposes methods to access the gateway api */
export class Oauth2Api implements Api {

  /** Gateway authentication api name */
  public static readonly apiName = 'Oauth2Api';

  /** @inheritdoc */
  public readonly apiName = Oauth2Api.apiName;

  /** @inheritDoc */
  public client: ApiClient;

  /**
   * Initialize your interface
   *
   * @param apiClient
   * @params apiClient Client used to process call to the API
   */
  constructor(apiClient: ApiClient) {
    this.client = apiClient;
  }

  /**
   * Retrieve information about a given access token generated using the POST /token operation
   * Operation to get information  (ie time before expiration, type, status, etc.) about a given access_token generated via the POST /tokens operation.
   * The HTTP method to use is GET. All other HTTP methods are forbidden and an exception (ie error 405: Invalid HTTP method) is raised.
   * The path parameter to give is a valid access token (this access token can be revoked or expired but need to be created at least).
   * If this token is invalid, an exception is raised (ie error 404: Resource not found).
   *
   * @param data Data to provide to the API call
   */
  public async getAccessTokenInfo(data: GetAccessTokenInfo): Promise<Response> {

    const getParams = this.client.extractQueryParams<GetAccessTokenInfo>(data, [] as never[]);
    const headers: { [key: string]: string } = {};

    const basePathUrl = `${this.client.options.basePath}/token/${data.access_token}`;

    const options = await this.client.prepareOptions(basePathUrl, 'GET', getParams, headers, undefined);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);
    const ret = this.client.processCall<Response>(url, options, ApiTypes.DEFAULT, Oauth2Api.apiName, reviveResponse);
    return ret;
  }

  /**
   * Generate a temporary access token which makes the user able to pass throught authentication policy and consume Amadeus resources in a secure way
   * Operation to generate an access token in order to pass throught authentication and then consume Amadeus resources in a secure way.
   * The HTTP method to use is POST. All other HTTP methods are forbidden and an exception (ie error 405: Invalid HTTP method) is raised.
   * A given body using the x-www-form-urlencoded format is madatory. In this body, client_id (id of the app), client_secret (secret of the app)
   * and grant_type are mandatory. If one of these parameters are missing or invalid, an exception (ie error 401: Invalid parameters) is raised.
   * The value for grant_type parameter is unique: client_credentials. All others values will raise an exception (ie error 400: Invalid parameters).
   *
   * @param data Data to provide to the API call
   */
  public async postAccessToken(data: PostAccessToken): Promise<Response> {

    const getParams = this.client.extractQueryParams<PostAccessToken>(data, [] as never[]);
    const headers: { [key: string]: string } = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
    // eslint-disable-next-line max-len
    let body = `${encodeURIComponent('client_id')}=${encodeURIComponent(data.bodyToProvide.client_id)}&${encodeURIComponent('client_secret')}=${encodeURIComponent(data.bodyToProvide.client_secret)}&${encodeURIComponent('grant_type')}=${encodeURIComponent(data.bodyToProvide.grant_type)}`;
    if (data.bodyToProvide.guest_office_id) {
      body = `${body}&${encodeURIComponent('guest_office_id')}=${encodeURIComponent(data.bodyToProvide.guest_office_id)}`;
    }

    const basePathUrl = `${this.client.options.basePath}/token`;

    const options = await this.client.prepareOptions(basePathUrl, 'POST', getParams, headers, body || undefined);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);
    const ret = this.client.processCall<Response>(url, options, ApiTypes.DEFAULT, Oauth2Api.apiName, reviveResponse);
    return ret;
  }

}
