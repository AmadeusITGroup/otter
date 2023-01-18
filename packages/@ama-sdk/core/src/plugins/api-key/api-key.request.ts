import { PluginRunner, RequestOptions, RequestPlugin } from '../core';

/**
 * Plugin to add an API Key
 */
export class ApiKeyRequest implements RequestPlugin {

  private apiKey: string | (() => string | Promise<string>);
  private apiKeyHeader: string;

  /**
   * Initialize your plugin
   *
   * @param apiKey       API Key of your API
   * @param apiKeyHeader Header where to store your API key
   */
  constructor(apiKey: string | (() => string | Promise<string>), apiKeyHeader = 'apiKey') {
    this.apiKey = apiKey;
    this.apiKeyHeader = apiKeyHeader;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        const apiKey = typeof this.apiKey === 'string' ? this.apiKey : await this.apiKey();
        data.headers.append(this.apiKeyHeader, apiKey);
        return data;
      }
    };
  }

}
