import type { RequestBody, RequestMetadata, RequestOptions, TokenizedOptions } from '../../plugins/index';
import type { ApiTypes } from '../api';
import type { Api } from '../api.interface';
import type { ReviverType } from '../Reviver';
import type { BaseApiClientOptions } from './base-api-constructor';

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
   */
  api: Api;
}

/**
 * API Client used by the SDK's APIs to call the server
 * The list of official clients is available in @ama-sdk/core {@link https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/README.md#available-api-client|readme}
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
   * Retrieve the option to process the HTTP Call
   */
  getRequestOptions(requestOptionsParameters: RequestOptionsParameters): Promise<RequestOptions>;

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
    typeof client.getRequestOptions === 'function' &&
    typeof client.prepareUrl === 'function' &&
    typeof client.processFormData === 'function' &&
    typeof client.processCall === 'function';
}
