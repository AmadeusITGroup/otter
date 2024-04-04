import type { Plugin, PluginContext, PluginRunner } from './plugin';

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
  /** Signal to abort the request */
  signal?: AbortSignal;
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
  /** @inheritdoc */
  method: NonNullable<RequestInit['method']>;
}

/**
 * Interface of an SDK request plugin context.
 */
export interface RequestPluginContext extends PluginContext {}

/**
 * Interface of an SDK request plugin.
 * The plugin will be run on the request of a call
 */
export interface RequestPlugin extends Plugin<RequestOptions, RequestOptions> {
  /**
   * Load the plugin with the context
   * @param context Context of request plugin
   */
  load(context?: RequestPluginContext): PluginRunner<RequestOptions, RequestOptions>;
}
