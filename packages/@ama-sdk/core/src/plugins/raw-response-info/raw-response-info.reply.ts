import { ApiTypes } from '../../fwk/api';
import { PluginRunner, ReplyPlugin, ReplyPluginContext } from '../core';

/**
 * Interface of the response information
 */
export interface ResponseInfo extends Readonly<NonNullable<ReplyPluginContext<any>['response']>> {
  /** API Type */
  apiType: string | ApiTypes;

  /** API Name */
  apiName: string | undefined;
}

/**
 * interface of an API reply containing a ResponseInfo
 */
export interface RawResponseReply {
  /** HTTP Response Information */
  responseInfo: ResponseInfo;
}

/**
 * Plugin to add the Raw response to the reply object in `responseInfo` property.
 */
export class RawResponseInfoReply<V = {[key: string]: any} | undefined> implements ReplyPlugin<V, V> {

  /**
   * Check if the Reply has a Response Info
   * @param reply API call reply
   * @returns Cast the reply to add responseInfo field
   */
  public static hasResponseInfo<T extends {[key: string]: any} | undefined>(reply: T): reply is T & RawResponseReply {
    return !!(reply && reply.responseInfo);
  }

  /**
   * Initialize your plugin
   * @param customInfo Custom information to add to the reply
   */
  constructor() {}

  public load<K>(context: ReplyPluginContext<K>): PluginRunner<V | V & RawResponseReply, V> {
    return {
      transform: (data: V) => {
        if (!context.response) { return data; }

        const responseInfo: RawResponseReply = {
          responseInfo: {
            ...context.response,
            apiType: context.apiType,
            apiName: context.apiName
          }
        };

        return data ? Object.assign(data, responseInfo) : responseInfo as V & RawResponseReply;
      }
    };
  }

}
