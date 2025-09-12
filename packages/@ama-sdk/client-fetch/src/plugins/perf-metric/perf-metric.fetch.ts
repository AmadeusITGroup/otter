import {
  PerformanceMetricService,
} from '@ama-sdk/core';
import type {
  Mark as CoreMark,
  PerformanceMetricOptions as CorePerformanceMetricOptions,
} from '@ama-sdk/core';
import type {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
} from '../../fetch-plugin';

/**
 * Performance metric mark associated to a call.
 * @deprecated use {@link CoreMark|Mark from @ama-sdk/core} instead. Will be removed in v15
 */
export type Mark = CoreMark;

/**
 * Options for the Performance Metric Plugin.
 * @deprecated use {@link CorePerformanceMetricOptions|PerformanceMetricOptions from @ama-sdk/core} instead. Will be removed in v15
 */
export type PerformanceMetricOptions = CorePerformanceMetricOptions;

/**
 * Performance metric plugin.
 */
export class PerformanceMetricPlugin extends PerformanceMetricService implements FetchPlugin {
  /** @inheritDoc */
  public load(context: FetchPluginContext) {
    return {
      transform: async (fetchCall: FetchCall) => {
        const markId = this.openMark(context.url, context.options);

        try {
          const response = await fetchCall;
          this.closeMark(markId, response);
          return response;
        } catch (exception: any) {
          this.closeMarkWithError(markId, exception);
          throw exception;
        }
      }
    };
  }
}
