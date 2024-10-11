import type { FetchCall, FetchPlugin, FetchPluginContext } from '../../fetch-plugin';

/** Callback function type */
export type CallbackFunction<T> = (context: FetchPluginContext & {data: T | undefined}, fetchCall: FetchCall, response?: Response) => void;

/** Result of the condition function */
export interface CanStartConditionResult<T = any> {
  /** Actual result of the condition */
  result: boolean | Promise<boolean>;

  /** Data can be used to store data between the condition function and the callback */
  data?: T;
}

/**
 * Condition function to determine if the call can start
 * @returns True if the call can start, False if it should be canceled
 */
export type CanStartConditionFunction<T = any> = (context: FetchPluginContext) => CanStartConditionResult<T> | Promise<CanStartConditionResult<T>>;

/**
 * Plugin to determine if and when a call should be processed
 * @example
 * ```typescript
 * // Use the plugin for an orchestrator 1 per 1
 * class OrchestratorOnePerOne {
 *   stack: ({id: string, resolve: (result: boolean) => void})[] = [];
 *
 *   private resolve() {
 *     if (this.stack.length) {
 *       this.stack[0].resolve(true);
 *     }
 *   }
 *
 *   public push(): CanStartConditionResult<string> {
 *     const id = uuid();
 *     const ret = {
 *       data: id,
 *       result: new Promise<boolean>((resolve) => {
 *         this.stack.push({id, resolve});
 *         if (this.stack.length === 1) {
 *           this.resolve();
 *         }
 *       })
 *     };
 *
 *     return ret;
 *   }
 *
 *   public pop(id: string): void {
 *     this.stack = this.stack.filter((item) => item.id !== id);
 *     this.resolve();
 *   }
 * }
 *
 * const orchestrator = new OrchestratorOnePerOne();
 * const waitForPlugin = new WaitForFetch<string>(() => orchestrator.push(), undefined, (context) => orchestrator.pop(context.data));
 * const api = new Api('https://wwww.digitalforairlines.com/api', undefined, undefined, [waitForPlugin]);
 * ```
 */
export class WaitForFetch<T = any> implements FetchPlugin {

  /** Condition to wait to start the call */
  public canStartCondition: CanStartConditionFunction<T>;

  /** Timeout in ms (infinit if not defined) */
  public timeout?: number;

  /** Function callback called when the fetch call has been executed */
  public callback?: CallbackFunction<T>;

  /**
   * Wait For Fetch plugin
   * @param canStartCondition Condition that should be passed to start the call
   * @param timeout           Timeout of the condition function (return false when reached)
   * @param callback          Callback function called when the fetch call has been processed
   */
  constructor(canStartCondition: CanStartConditionFunction<T>, timeout?: number, callback?: CallbackFunction<T>) {
    this.canStartCondition = canStartCondition;
    this.timeout = timeout;
    this.callback = callback;
  }


  /** @inheritDoc */
  public load(context: FetchPluginContext) {
    let data: T | undefined;

    return {
      // eslint-disable-next-line no-async-promise-executor
      canStart: () => new Promise<boolean>(async (resolve) => {
        let didTimeOut = false;
        let timer: any;

        if (this.timeout) {
          timer = setTimeout(() => {
            didTimeOut = true;
            resolve(false);
          }, this.timeout);
        }

        try {
          const canStartCondition = await this.canStartCondition(context);
          data = canStartCondition.data;
          const canStart = await canStartCondition.result;

          if (!didTimeOut) {
            resolve(canStart);
          }
        } catch (ex) {
          if (!didTimeOut) {
            resolve(false);
          }
        } finally {
          if (timer) {
            clearTimeout(timer);
          }
        }
      }),

      transform: async (fetchCall: FetchCall) => {
        if (!this.callback) {
          return fetchCall;
        }

        let response: Response | undefined;
        try {
          response = await fetchCall;
          this.callback({ ...context, data }, fetchCall, response);
          return response;
        } catch (e) {
          this.callback({ ...context, data }, fetchCall, response);
          throw e;
        }
      }
    };
  }

}
