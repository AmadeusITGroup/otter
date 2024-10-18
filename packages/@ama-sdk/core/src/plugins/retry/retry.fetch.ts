import {
  CanceledCallError
} from '../../fwk/errors';
import {
  FetchCall,
  FetchPlugin,
  FetchPluginContext
} from '../core';

/**
 * Function to run to determine if we need to retry the call
 * @param numberOfRetry
 * @param condition
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 * @example
 * ```typescript
 * const condition = async (context: FetchPluginContext, data?: Response, error?: Error) => {
 *   const status = data.status;
 *   return status !== 200;
 * }
 * const plugin = new RetryConditionType(5, condition);
 * ```
 * @example
 * ```typescript
 * const condition = async (context: FetchPluginContext, data?: Response, error?: Error) => {
 *   const receivedData = data && await data.text();
 *   return !!data && /^error$/.test(data);
 * }
 * const plugin = new RetryConditionType(5, condition);
 * ```
 */
export type RetryConditionType = (context: FetchPluginContext, data?: Response, error?: Error) => boolean | Promise<boolean>;

/**
 * Plugin to Retry a fetch call
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export class RetryFetch implements FetchPlugin {
  /** Number of retry */
  public numberOfRetry: number;

  /** Condition of retrying */
  public condition: RetryConditionType;

  /** If we wait between the next retry. It will be random value between minSleep and maxSleep ms */
  public sleepBetweenRetry: (numberOfRetry?: number) => number | Promise<number>;

  /**
   * Retry Fetch plugin
   * @param numberOfRetry Number of retry
   * @param condition     Condition of retrying,  return true to launch the retry process
   * @param sleepBetweenRetry
   */
  constructor(
    numberOfRetry = 3,
    condition: RetryConditionType = (_context: FetchPluginContext, _data?: Response, error?: Error) => !(error instanceof CanceledCallError),
    sleepBetweenRetry: (numberOfRetry?: number) => number | Promise<number> = () => 0) {
    this.numberOfRetry = numberOfRetry;
    this.condition = condition;
    this.sleepBetweenRetry = sleepBetweenRetry;
  }

  /**
   * Launch a retry
   * @param context
   */
  private retry(context: FetchPluginContext) {
    let asyncResponse = fetch(context.url, context.options);
    for (const plugin of context.fetchPlugins) {
      asyncResponse = plugin.transform(asyncResponse);
    }
    return asyncResponse;
  }

  private async delay(countDown: number) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => setTimeout(resolve, await this.sleepBetweenRetry(countDown)));
  }

  private async waitAndRetry(context: FetchPluginContext, countDown: number) {
    await this.delay(countDown);
    return this.retry(context);
  }

  /** @inheritDoc */
  public load(context: FetchPluginContext) {
    let countDown = this.numberOfRetry;

    return {
      transform: async (fetchCall: FetchCall) => {
        try {
          const result = await fetchCall;
          if (!result.ok && countDown > 0) {
            const conditionResult = await this.condition(context, result.clone());
            if (conditionResult) {
              countDown--;
              return this.waitAndRetry(context, countDown);
            }
          }
          return result;
        } catch (e: any) {
          if (countDown) {
            const conditionResult = await this.condition(context, undefined, e);
            if (conditionResult) {
              countDown--;
              return this.waitAndRetry(context, countDown);
            }
          }
          throw e;
        }
      }
    };
  }
}
