import {
  ReplyPlugin,
  RequestPlugin,
} from '../../plugins';
import type {
  Logger,
} from '../logger';
import type {
  ParamSerialization,
  SupportedParamInterface,
} from '../param-serialization';

/** Interface of the constructor configuration object */
export interface BaseApiClientOptions {
  /** API Gateway base path (when targeting a proxy or middleware) */
  basePath: string;
  /** List of plugins to apply on the request before calling the API */
  requestPlugins: RequestPlugin[];
  /**
   * List of plugins to apply to the reply of the API call
   * @default [new ReviverReply(), new ExceptionReply()]
   */
  replyPlugins: ReplyPlugin<any>[];
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

/** Interface of the constructor configuration object */
export interface BaseApiConstructor extends Partial<BaseApiClientOptions> {
}

/**
 * Determine if object passed to the constructor is valid
 * @param args
 */
export function isConstructorObject(args: any[]): args is [BaseApiConstructor] {
  return !!args && args.length === 1 && !!args[0] && typeof args[0] === 'object';
}
