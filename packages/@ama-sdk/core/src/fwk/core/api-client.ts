import type {
  RequestBody,
  RequestMetadata,
  RequestOptions,
  TokenizedOptions,
} from '../../plugins/index';
import type {
  ApiTypes,
} from '../api';
import type {
  ParamSerialization,
} from '../api.helpers';
import type {
  Api,
} from '../api.interface';
import type {
  ReviverType,
} from '../reviver';
import type {
  BaseApiClientOptions,
} from './base-api-constructor';

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
   * Prepares the url to be called
   * @param url base url to be used
   * @param data Query parameters key value pair. If the value is undefined, the key is dropped.
   * @deprecated use `prepareUrl` with query parameter serialization, will be removed in v14.
   */
  prepareUrl(url: string, data?: { [key: string]: string | undefined }): string;
  /**
   * Prepares the url to be called
   * @param url base url to be used
   * @param data Data to provide to the API call
   * @param queryParamSerialization Query parameter serialization, defined by `explode` and `style`
   */
  prepareUrl<T extends { [key: string]: any }>(url: string, data: T, queryParamSerialization: { [K in keyof T]?: ParamSerialization }): string;
  /**
   * Prepares the url to be called
   * @param url base url to be used
   * @param data Data to provide to the API call
   * @param queryParamSerialization Query parameter serialization, defined by `explode` and `style`
   */
  prepareUrl<T extends { [key: string]: any }>(url: string, data?: { [key: string]: string | undefined } | T, queryParamSerialization?: { [K in keyof T]?: ParamSerialization }): string;

  /**
   * Prepares the path parameters for the URL to be called
   * @param data
   * @param pathParameters key value pair with the parameters. If the value is undefined, the key is dropped
   */
  serializePathParams<T extends { [key: string]: any }>(data: T, pathParameters: { [K in keyof T]?: ParamSerialization }): { [p in keyof T]: string };

  /**
   * Returns tokenized request options:
   * URL/query parameters for which sensitive parameters are replaced by tokens and the corresponding token-value associations
   * @param url URL for which parameters containing PII have been replaced by tokens
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
  processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, revivers?: ReviverType<T> |
    { [key: number]: ReviverType<T> | undefined }, operationId?: string): Promise<T>;
}

/**
 * Check if the object is an Api Client object
 * @param client object to check
 */
export function isApiClient(client: any): client is ApiClient {
  const apiClient: ApiClient | undefined = client;
  return !!apiClient
    && !!apiClient.options
    && typeof apiClient.extractQueryParams === 'function'
    && typeof apiClient.getRequestOptions === 'function'
    && typeof apiClient.prepareUrl === 'function'
    && typeof apiClient.processFormData === 'function'
    && typeof apiClient.processCall === 'function';
}
