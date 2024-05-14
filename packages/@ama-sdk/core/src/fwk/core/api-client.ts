import {RequestBody, RequestMetadata, RequestOptions, TokenizedOptions} from '../../plugins/index';
import {ApiTypes} from '../api';
import type { Api } from '../api.interface';
import {ReviverType} from '../Reviver';
import {BaseApiClientOptions} from './base-api-constructor';

/** Parameters to the request the call options */
export interface RequestOptionsParameters {
  /** URL of the call to process (without the query parameters) */
  basePath: string;
  /** Query Parameters */
  queryParams?: { [key: string]: string | undefined };
  /** Force body to string */
  body?: RequestBody;
  /** Force headers to Headers type */
  headers: { [key: string]: string | undefined };
  /** Tokenized options to replace URL and query parameters */
  tokenizedOptions?: TokenizedOptions;
  /** Request metadata */
  metadata?: RequestMetadata;
  /** HTTP Method used for the request */
  method: NonNullable<RequestInit['method']>;
  /**
   * API initializing the call
   * @todo this field will be turned as mandatory in v11
   */
  api?: Api;
}

/**
 * API Client used by the SDK's APIs to call the server
 */
export interface ApiClient {

  /** Options for the API */
  options: BaseApiClientOptions;

  /**
   * Returns a map containing the query parameters
   * @param data
   * @param names
   */
  extractQueryParams<T extends { [key: string]: any }>(data: T, names: (keyof T)[]): { [p in keyof T]: string; };

  /**
   * Prepare Options
   * @deprecated use getRequestOptions instead, will be removed in v11
   */
  prepareOptions(url: string, method: string, queryParams: { [key: string]: string | undefined }, headers: { [key: string]: string | undefined }, body?: RequestBody,
    tokenizedOptions?: TokenizedOptions, metadata?: RequestMetadata): Promise<RequestOptions>;

  /**
   * Retrieve the option to process the HTTP Call
   * @todo turn this function mandatory when `prepareOptions` will be removed
   */
  getRequestOptions?(requestOptionsParameters: RequestOptionsParameters): Promise<RequestOptions>;

  /**
   * prepares the url to be called
   * @param url base url to be used
   * @param queryParameters key value pair with the parameters. If the value is undefined, the key is dropped
   */
  prepareUrl(url: string, queryParameters?: { [key: string]: string | undefined }): string;


  /**
   * Returns tokenized request options:
   * URL/query parameters for which sensitive parameters are replaced by tokens and the corresponding token-value associations
   * @param tokenizedUrl URL for which parameters containing PII have been replaced by tokens
   * @param queryParameters Original query parameters
   * @param piiParamTokens Tokens of the parameters containing PII
   * @param data Data to provide to the API call
   * @returns the tokenized request options if tokenization is enabled, undefined otherwise
   */
  tokenizeRequestOptions(url: string, queryParameters: { [key: string]: string | undefined }, piiParamTokens: { [statusCode: string]: string }, data: any): TokenizedOptions | undefined;

  /**
   * Receives an object containing key/value pairs
   * Encodes this object to match application/x-www-urlencoded or multipart/form-data
   */
  processFormData(data: any, type: string): FormData | string;

  /** Process HTTP call */
  processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, revivers?: ReviverType<T> | undefined |
    {[key: number]: ReviverType<T> | undefined}, operationId?: string): Promise<T>;
}

/**
 * Check if the object is an Api Client object
 * @param client object to check
 */
export function isApiClient(client: any): client is ApiClient {
  return client &&
    !!client.options &&
    typeof client.extractQueryParams === 'function' &&
    typeof client.prepareOptions === 'function' &&
    typeof client.prepareUrl === 'function' &&
    typeof client.processFormData === 'function' &&
    typeof client.processCall === 'function';
}
