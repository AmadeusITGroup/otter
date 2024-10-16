import {PluginRunner, ReplyPlugin, ReplyPluginContext} from '../core';

/**
 * Plugin to inject in the reply custom information
 */
export class CustomInfoReply<G = {[key: string]: any}, V extends {[key: string]: any} | undefined = {[key: string]: any}> implements ReplyPlugin<V, V> {

  /**
   * Builds your plugin
   * @param customInfo the custom information to inject in the reply
   */
  constructor(private readonly customInfo: G) {}

  /**
   * Checks if the reply has a customInfo node
   * @param reply
   */
  // eslint-disable-next-line no-use-before-define
  public hasCustomInfo<T extends { [key: string]: any; customInfo?: K } | undefined = { [key: string]: any; customInfo: any },
    K = { [key: string]: any }>(reply: T): reply is T & { customInfo: K & G } {
    return !!(reply && reply.customInfo);
  }

  public load<K, X extends { [key: string]: any} | undefined = { [key: string]: any}>(_context: ReplyPluginContext<K>): PluginRunner<V & { customInfo: X & G }, V & { customInfo?: X }> {
    return {
      transform: (data: V) => Object.assign(data || Object.assign({}, data), {
        customInfo: data && data.customInfo ? Object.assign(data.customInfo, this.customInfo) : this.customInfo
      }) as (typeof data & { customInfo: any })
    };
  }
}
