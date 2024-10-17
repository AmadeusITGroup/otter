import {PluginRunner, RequestOptions, RequestPlugin} from '../core';

/**
 * Plugin to add the keepalive flag to the request
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export class KeepaliveRequest implements RequestPlugin {

  private active: boolean | undefined;

  constructor(force = false) {
    if (force) {
      this.active = true;
    } else {
      void this.testKeepAlive();
    }
  }

  /**
   * Keepalive flag has a partial support on some browsers, especially due to custom Headers.
   * For instance, using the flag with custom headers causes the browser to trigger an error:
   * 'Preflight request for request with keepalive specified is currently not supported'
   * https://bugs.chromium.org/p/chromium/issues/detail?id=835821
   * To avoid this issue we do a fake fetch call to check whether we can activate it or not in the browser.
   */
  private async testKeepAlive() {
    const customHeaders = new Headers();
    customHeaders.set('Content-Type', 'application/json');
    try {
      await fetch('', {headers: customHeaders, keepalive: true});
      this.active = true;
    } catch {
      this.active = false;
    }
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        return {...data, keepalive: this.active};
      }
    };
  }
}
