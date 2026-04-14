import {
  PluginRunner,
  RequestOptions,
  RequestPlugin,
} from '../core';

/**
 * Plugin to send a jwt with the request
 */
export class JsonTokenRequest implements RequestPlugin {
  private readonly storageTokenKey: string;
  private readonly sharedMemory: { [key: string]: any };

  /**
   * Initialize your plugin
   * @param storageTokenKey   Key used to store the token
   * @param sharedMemory      Only useful for NodeJS - Will keep data such as JWT tokens in memory instead of sessionStorage
   */
  constructor(storageTokenKey = 'DP_SDK_AUTH_TOKEN', sharedMemory: { [key: string]: any } = {}) {
    this.storageTokenKey = storageTokenKey;
    this.sharedMemory = sharedMemory;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        // Handle Authorization Tokens
        const token = (typeof sessionStorage === 'undefined' ? this.sharedMemory[this.storageTokenKey] : sessionStorage.getItem(this.storageTokenKey)) as string | undefined;
        if (token) {
          data.credentials = 'same-origin';
          data.headers.append('Authorization', token);
        }
        return data;
      }
    };
  }
}
