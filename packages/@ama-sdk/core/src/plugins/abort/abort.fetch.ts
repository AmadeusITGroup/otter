import type {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
  RequestOptions
} from '../core';

interface AbortCallbackParameters {
  /** URL targeted */
  url: string;

  /** Fetch call options */
  options: RequestInit | RequestOptions;

  // TODO Now supported for all the modern browsers - should become mandatory in @ama-sdk/core@11.0
  /** Abort controller to abort fetch call */
  controller?: AbortController;
}

const isPromise = (result: boolean | void | Promise<void> | Promise<boolean>): result is (Promise<void> | Promise<boolean>) => {
  if (typeof result !== 'object') {
    return false;
  }

  return true;
};

/**
 * Abort callback
 * Returns `true` to abort a request (or access directly to the controller to cancel fetch request)
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 * @example Immediate abort on URL match
 * ```typescript
 * const abortCondition: AbortCallback = ({url}) => url.endsWith('pet');
 *
 * const client = new ApiFetchClient(
 *   {
 *     basePath: 'https://petstore3.swagger.io/api/v3',
 *     fetchPlugins: [new AbortFetch(abortCondition)]
 *   }
 * );
 * ```
 * @example Abort on external event
 * ```typescript
 * import { firstValueFrom } from 'rxjs';
 * import { myObservable } from 'somewhere';
 *
 * const abortCondition: AbortCallback = ((observable: any) => () => firstValueFrom(observable).then((value) => !!value))(myObservable);
 *
 * const client = new ApiFetchClient(
 *   {
 *     basePath: 'https://petstore3.swagger.io/api/v3',
 *     fetchPlugins: [new AbortFetch(abortCondition)]
 *   }
 * );
 * ```
 * @example Abort on Timeout
 * ```typescript
 * const abortCondition: AbortCallback = ({controller}) => { setTimeout(() => controller?.abort(), 3000); };
 *
 * const client = new ApiFetchClient(
 *   {
 *     basePath: 'https://petstore3.swagger.io/api/v3',
 *     fetchPlugins: [new AbortFetch(abortCondition)]
 *   }
 * );
 * ```
 */
export type AbortCallback = (controller?: AbortCallbackParameters) => void | boolean | Promise<void> | Promise<boolean>;

/** Plugin to abort a Fetch request */
export class AbortFetch implements FetchPlugin {
  /**
   * Abort Fetch plugin
   * @param abortCallback Condition that should be passed to start the call
   */
  constructor(public abortCallback: AbortCallback) {}

  /** @inheritDoc */
  public load(context: FetchPluginContext) {
    return {
      transform: (fetchCall: FetchCall) => {
        const abortCallbackResult = this.abortCallback();
        if (isPromise(abortCallbackResult)) {
          void abortCallbackResult.then((res) => res && context.controller?.abort());
        } else if (abortCallbackResult) {
          context.controller?.abort();
        }
        return fetchCall;
      }
    };
  }
}
