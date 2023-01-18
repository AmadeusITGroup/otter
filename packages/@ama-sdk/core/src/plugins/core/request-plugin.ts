import { Plugin, PluginRunner } from './plugin';

export type RequestBody = string | FormData;

/**
 * Tokenized URL/query parameters for which sensitive parameters are replaced by token and the corresponding token-value associations.
 */
export interface TokenizedOptions {
  /** Tokenized URL */
  url: string;
  /** Tokenized query parameters */
  queryParams: { [key: string]: string };
  /** An object associating tokens with the actual values */
  values: { [token: string]: string };
}

/**
 * Interface defining DeepLink protocol
 */
export interface DeepLinkOptions {
  /** Encrypted Token containing sensitive parameters as key-value*/
  token: string;
  /** Challenge Anwsers to reauthenticate when token has expired*/
  challengeAnswers?: Record<string, string>;
}
/**
 * Metadata that might provide further information to the request
 */
export interface RequestMetadata<C extends string = string, A extends string = string> {
  /** @see DeepLinkOptions */
  deepLinkOptions?: DeepLinkOptions;
  /** Force a MIME type to be used as Content-Type header */
  headerContentType?: C;
  /** Force a MIME type to be used as Accept header */
  headerAccept?: A;
}

export interface RequestOptions extends RequestInit {
  /** Query Parameters */
  queryParams?: { [key: string]: string };
  /** Force body to string */
  body?: RequestBody;
  /** Force headers to Headers type */
  headers: Headers;
  /** URL targeted without the query parameters */
  basePath: string;
  /** Tokenized options to replace URL and query parameters */
  tokenizedOptions?: TokenizedOptions;
  /** Request metadata */
  metadata?: RequestMetadata;
}

/**
 * Interface of an SDK request plugin.
 * The plugin will be run on the request of a call
 */
export interface RequestPlugin extends Plugin<RequestOptions, RequestOptions> {
  /** Load the plugin with the context */
  load(): PluginRunner<RequestOptions, RequestOptions>;
}
