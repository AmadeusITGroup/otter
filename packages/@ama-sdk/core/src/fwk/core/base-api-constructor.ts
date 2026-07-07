import {
  ReplyPlugin,
  type RequestOptions,
  RequestPlugin,
} from '../../plugins';
import type {
  Logger,
} from '../logger';
import type {
  ParamSerialization,
  SupportedParamInterface,
} from '../param-serialization';

/** Server configuration to use for the request */
export interface ServerConfiguration {
  /**
   * Index of the server in the list
   * The first server will be used if not specified
   */
  index?: number;
  /** Variables used in the server URL defined in the specification */
  variables?: Record<string, string>;
}

/** Base path and server configuration and selection to use for the request */
export interface BasePathServer {
  /**
   * URL of the call to process (without the query parameters)
   * Note: If both {@link basePath} and {@link server} are provided, server will be ignored
   * @example 'https://api.example.com/v1/resource'
   */
  basePath?: string;
  /** Default basePath to use if no {@link basePath} is provided, no server are matching the API server list and no default server has been specified in the specification  */
  defaultBasePath?: string;
  /** basePath server configuration to use for the request */
  server?: ServerConfiguration;
}

/** Interface of the constructor configuration object */
export interface BaseApiClientOptions extends BasePathServer {
  /** List of plugins to apply on the request before calling the API */
  requestPlugins: RequestPlugin[] | ((originalRequestOpts: RequestOptions) => RequestPlugin[] | Promise<RequestPlugin[]>);
  /**
   * List of plugins to apply to the reply of the API call
   * @default [new ReviverReply(), new ExceptionReply()]
   */
  replyPlugins: ReplyPlugin[];
  /** Indicates if the tokenization is enabled and if the tokenized request options should be computed */
  enableTokenization?: boolean;
  /** Disable the fallback on the first success code reviver if the response returned by the API does not match the list of expected success codes */
  disableFallback?: boolean;
  /** Logger (optional, fallback to console logger if undefined) */
  logger?: Logger;
  /** Enable parameter serialization with exploded syntax */
  enableParameterSerialization?: boolean;
  /** Custom query parameter serialization method */
  serializeQueryParams?<T extends SupportedParamInterface<T>>(queryParams: T, queryParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string };
  /** Custom query parameter serialization method */
  serializePathParams?<T extends SupportedParamInterface<T>>(pathParams: T, pathParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string };
}

/**
 * Interface of the constructor configuration object
 * @deprecated Not used any more as each ApiClient should redefine their constructor options. Will be removed in V14.
 */
export interface BaseApiConstructor extends Partial<BaseApiClientOptions> {
}

/**
 * Determine if object passed to the constructor is valid
 * @deprecated Not used any more as each ApiClient should redefine their constructor options. Will be removed in V14.
 * @param args
 */
export function isConstructorObject(args: any[]): args is [BaseApiConstructor] {
  return !!args && args.length === 1 && !!args[0] && typeof args[0] === 'object';
}
