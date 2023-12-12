import { PluginRunner, RequestOptions, RequestPlugin } from '../core';

/**
 * Plugin to set the "credentials" option of the fetch API for every request it is applied to.
 */
export class FetchCredentialsRequest implements RequestPlugin {

  /**
   * Value that will be set as the "credentials" option of the fetch API.
   * Defaulted to "same-origin"
   */
  private readonly credentialsValue: RequestCredentials;

  constructor(credentialsValue: RequestCredentials = 'same-origin') {
    this.credentialsValue = credentialsValue;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        data.credentials = this.credentialsValue;
        return data;
      }
    };
  }
}
