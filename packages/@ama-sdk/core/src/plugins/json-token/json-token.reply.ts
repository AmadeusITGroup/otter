import {
  PluginRunner,
  ReplyPlugin,
  ReplyPluginContext
} from '../core';

/**
 * Plugin to store a jwt received in a reply
 */
export class JsonTokenReply<V = { [key: string]: any } | undefined> implements ReplyPlugin<V, V> {
  private storageTokenKey: string;
  private sharedMemory: { [key: string]: any };

  /**
   * Initialize your plugin
   * @param storageTokenKey   Key used to store the token
   * @param sharedMemory      Only useful for NodeJS - Will keep data such as JWT tokens in memory instead of sessionStorage
   */
  constructor(storageTokenKey = 'DP_SDK_AUTH_TOKEN', sharedMemory: { [key: string]: any } = {}) {
    this.storageTokenKey = storageTokenKey;
    this.sharedMemory = sharedMemory;
  }

  public load<K>(context: ReplyPluginContext<K>): PluginRunner<V, V> {
    return {
      transform: (data: V) => {
        if (!context.response) {
          return data;
        }

        if (context.response.headers.has('Authorization')) {
          const token = context.response.headers.get('Authorization') as string;
          if (typeof sessionStorage === 'undefined') {
            this.sharedMemory[this.storageTokenKey] = token;
          } else {
            sessionStorage.setItem(this.storageTokenKey, token);
          }
        } else {
          if (typeof sessionStorage === 'undefined') {
            this.sharedMemory[this.storageTokenKey] = undefined;
          } else {
            sessionStorage.removeItem(this.storageTokenKey);
          }
        }

        return data;
      }
    };
  }
}
