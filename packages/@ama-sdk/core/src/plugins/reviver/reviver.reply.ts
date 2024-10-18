import type {
  ReviverOptions
} from '../../fwk/Reviver';
import {
  PluginRunner,
  ReplyPlugin,
  ReplyPluginContext
} from '../core';

/**
 * Plugin to revive a reply from the SDK
 */
export class ReviverReply<V = { [key: string]: any }> implements ReplyPlugin<undefined, V> {
  /**
   * Instance a plugin to revive a reply from the SDK
   * @param options Reviver options
   */
  constructor(public readonly options?: ReviverOptions) {}

  public load<K>(context: ReplyPluginContext<K>): PluginRunner<K | undefined, V> {
    const options: ReviverOptions = {
      logger: context.logger,
      ...this.options
    };

    return {
      transform: (data?: V) => {
        const ret = context.reviver && data ? context.reviver(data, context.dictionaries, options) : (data || {}) as any as K;
        return ret;
      }
    };
  }
}
