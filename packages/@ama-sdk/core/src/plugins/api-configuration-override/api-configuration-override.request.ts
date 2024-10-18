import {
  AsyncPluginInput,
  PluginRunner,
  RequestOptions,
  RequestPlugin
} from '../core';

/**
 *  The purpose of this plugin is to allow to send an encrypted JWT which overrides the configuration used by Digital Commerce.
 *  The plugin takes an already encoded JWT (JWS) and add it in an instance of `ama-client-facts` header.
 *  @note this is the default value for the header name. It can be customized at plugin initialization time.
 */
export class ApiConfigurationOverride implements RequestPlugin {
  private readonly jws: AsyncPluginInput<string>;
  private readonly headerName: string;

  /**
   * Initialize your plugin
   * @param jws already formed JWS (signed token)
   * @param headerName the name of the header
   */
  constructor(jws: AsyncPluginInput<string>, headerName = 'ama-client-facts') {
    this.jws = jws;
    this.headerName = headerName;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        const jws = await (typeof this.jws === 'function' ? this.jws() : this.jws);

        if (jws) {
          data.headers.append(this.headerName, jws);
        }

        return data;
      }
    };
  }
}
