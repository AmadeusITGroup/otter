import { PluginRunner, ReplyPlugin, ReplyPluginContext } from '../core';

/**
 * Plugin to revive a reply from the SDK
 */
export class ReviverReply<V = {[key: string]: any}> implements ReplyPlugin<undefined, V> {

  public load<K>(context: ReplyPluginContext<K>): PluginRunner<K | undefined, V> {
    return {
      transform: (data?: V) => {
        const ret = context.reviver && data ? context.reviver(data, context.dictionaries) : (data || {}) as any as K;
        return ret;
      }
    };
  }

}
