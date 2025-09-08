import type {
  ParamSerializationOptions,
  RequestBody,
  RequestMetadata,
  RequestOptions,
  TokenizedOptions,
} from '../../plugins/index';
import type {
  ApiTypes,
} from '../api';
import type {
  Api,
} from '../api.interface';
import type {
  ParamSerialization,
  SupportedParamType,
} from '../param-serialization';
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
  /** Parameter serialization options */
  paramSerializationOptions?: ParamSerializationOptions;
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
   * @deprecated use {@link stringifyQueryParams} which accepts only supported types, will be removed in v14.
   */
  extractQueryParams<T extends { [key: string]: any }>(data: T, names: (keyof T)[]): { [p in keyof T]: string; };

  /**
   * Get requested properties from data
   * @param data Data to get properties from
   * @param keys Keys of properties to retrieve
   */
  getPropertiesFromData<T, K extends keyof T>(data: T, keys: K[]): Pick<T, K>;

  /**
   * Returns a map containing the query parameters
   * @param queryParams Query parameters of supported parameter types
   */
  stringifyQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T): { [p in keyof T]: string; };

  /**
   * Retrieve the option to process the HTTP Call
   */
  getRequestOptions(requestOptionsParameters: RequestOptionsParameters): Promise<RequestOptions>;

  /**
   * Prepares the url to be called
   * @param url Base url to be used
   * @param queryParameters Key value pair with the parameters. If the value is undefined, the key is dropped
   * @deprecated use {@link prepareUrlWithQueryParams} with query parameter serialization, will be removed in v14.
   */
  prepareUrl(url: string, queryParameters?: { [key: string]: string | undefined }): string;

  /**
   * Prepares the url to be called with the query parameters
   * @param url Base url to be used
   * @param serializedQueryParams Key value pairs of query parameter names and their serialized values
   */
  prepareUrlWithQueryParams(url: string, serializedQueryParams?: { [key: string]: string }): string;

  /**
   * Serialize query parameters based on the values of exploded and style
   * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
   * @param queryParams
   * @param queryParamSerialization
   */
  serializeQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T, queryParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string };

  /**
   * Prepares the path parameters for the URL to be called
   * @param pathParams
   * @param pathParamSerialization key value pair with the parameters. If the value is undefined, the key is dropped
   */
  serializePathParams<T extends { [key: string]: SupportedParamType }>(pathParams: T, pathParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string };

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
  processCall<T>(url: string, options: RequestOptions, apiType: ApiTypes | string, apiName: string, revivers?: ReviverType<T>
    | { [key: number]: ReviverType<T> | undefined }, operationId?: string): Promise<T>;
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
