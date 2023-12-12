import { ResponseTimeoutError } from '../../fwk/errors';
import { FetchCall, FetchPlugin, FetchPluginContext } from '../core';

/**
 * Plugin to fire an exception on timeout
 */
export class TimeoutFetch implements FetchPlugin {

  /** Fetch timeout (in millisecond) */
  public timeout: number;

  /**
   * Timeout Fetch plugin.
   * @param timeout Timeout in millisecond
   */
  constructor(timeout = 60000) {
    this.timeout = timeout;
  }

  public load(context: FetchPluginContext) {
    return {
      transform: (fetchCall: FetchCall) =>
        // eslint-disable-next-line no-async-promise-executor
        new Promise<Response>(async (resolve, reject) => {
          let didTimeOut = false;

          const timer = setTimeout(() => {
            didTimeOut = true;
            reject(new ResponseTimeoutError(`in ${this.timeout}ms`));
            if (context.controller) {
              context.controller.abort();
            }
          }, this.timeout);

          try {
            const response = await fetchCall;

            if (!didTimeOut) {
              resolve(response);
            }
          } catch (ex) {
            reject(ex);
          } finally {
            clearTimeout(timer);
          }
        })
    };
  }

}
