import {ResponseTimeoutError} from '../../fwk/errors';
import {FetchCall, FetchPlugin, FetchPluginContext} from '../core';

/**
 * Representation of an Imperva Captcha message
 */
type ImpervaCaptchaMessageData = {
  impervaChallenge: {
    type: 'captcha';
    status: 'started' | 'ended';
    timeout: number;
    url: string;
  };
};

/**
 * Type to describe the timer status of the {@see TimeoutFetch} plugin.
 * Today, only the stop and restart of the timer is supported which match the following events:
 * - stop: stop the timeout timer
 * - start: reset the timer and restart it
 */
export type TimeoutStatus = 'timeoutStopped' | 'timeoutStarted';

/**
 * Check if a message can be cast as an {@link ImpervaCaptchaMessage}
 *
 * @param message
 */
function isImpervaCaptchaMessage(message: any): message is ImpervaCaptchaMessageData {
  return Object.prototype.hasOwnProperty.call(message, 'impervaChallenge') &&
    Object.prototype.hasOwnProperty.call(message.impervaChallenge, 'status') &&
    Object.prototype.hasOwnProperty.call(message.impervaChallenge, 'type') && message.impervaChallenge.type === 'captcha';
}

/**
 * Event handler that will emit event to pause the timeout
 * Today the timeout only
 */
export type TimeoutPauseEventHandler = ((timeoutPauseCallback: (timeoutStatus: TimeoutStatus) => void, context: any) => () => void);
/**
 * Factory to generate a {@see TimeoutPauseEventHandler} depending on various configurations
 */
export type TimeoutPauseEventHandlerFactory<T> = (config?: Partial<T>) => TimeoutPauseEventHandler;

/**
 * Captures Imperva captcha events and calls the event callback
 * It can only be used for browser's integrating imperva captcha
 *
 * @param config: list of host names that can trigger a captcha event
 *
 * @return removeEventListener
 */
export const impervaCaptchaEventHandlerFactory: TimeoutPauseEventHandlerFactory<{ whiteListedHostNames: string[] }> = (config) =>
  (timeoutPauseCallback: (timeoutStatus: TimeoutStatus) => void) => {
    const onImpervaCaptcha = ((event: MessageEvent<any>) => {
      const originHostname = (new URL(event.origin)).hostname;
      if (originHostname !== location.hostname && (config?.whiteListedHostNames || []).indexOf(originHostname) === -1) {
        return;
      }
      let message = event.data;
      if (typeof event.data === 'string') {
        try {
          message = JSON.parse(event.data);
        } catch {
          // This might not be an imperva message
        }
      }
      if (typeof message === 'object' && isImpervaCaptchaMessage(message)) {
        timeoutPauseCallback(message.impervaChallenge.status === 'started' ? 'timeoutStopped' : 'timeoutStarted');
      }
    });
    addEventListener('message', onImpervaCaptcha);
    return () => {
      removeEventListener('message', onImpervaCaptcha);
    };
  };

/**
 * Plugin to fire an exception on timeout
 */
export class TimeoutFetch implements FetchPlugin {

  /** Fetch timeout (in millisecond) */
  public timeout: number;
  private timerSubscription: ((pauseStatus: TimeoutStatus) => void)[] = [];
  private timerPauseState: TimeoutStatus = 'timeoutStarted';

  /**
   * Timeout Fetch plugin.
   *
   * @param timeout Timeout in millisecond
   * @param timeoutPauseEvent Event that will trigger the pause and reset of the timeout
   */
  constructor(timeout = 60000, private timeoutPauseEvent?: TimeoutPauseEventHandler) {
    this.timeout = timeout;
    if (this.timeoutPauseEvent) {
      this.timeoutPauseEvent((pausedStatus: TimeoutStatus) => {
        this.timerPauseState = pausedStatus;
        this.timerSubscription.forEach((timer) => timer.call(this, pausedStatus));
      }, this);
    }
  }

  public load(context: FetchPluginContext) {
    return {
      transform: (fetchCall: FetchCall) =>
        // eslint-disable-next-line no-async-promise-executor
        new Promise<Response>(async (resolve, reject) => {
          const timeoutCallback = () => {
            reject(new ResponseTimeoutError(`in ${this.timeout}ms`));
            // Fetch abort controller is now supported by all modern browser and node 15+. It should always be defined
            context.controller?.abort();
          };
          let timer = this.timerPauseState === 'timeoutStopped' ? undefined : setTimeout(timeoutCallback, this.timeout);
          const timerCallback = (pauseStatus: TimeoutStatus) => {
            if (timer && pauseStatus === 'timeoutStopped') {
              clearTimeout(timer);
              timer = undefined;
            } else if (!timer && pauseStatus === 'timeoutStarted') {
              timer = setTimeout(timeoutCallback, this.timeout);
            }
          };
          this.timerSubscription.push(timerCallback);

          try {
            const response = await fetchCall;
            if (!context.controller?.signal.aborted) {
              resolve(response);
            }
          } catch (ex) {
            reject(ex);
          } finally {
            if (timer) {
              clearTimeout(timer);
            }
            this.timerSubscription = this.timerSubscription.filter(callback => timerCallback !== callback);
          }
        })
    };
  }
}
