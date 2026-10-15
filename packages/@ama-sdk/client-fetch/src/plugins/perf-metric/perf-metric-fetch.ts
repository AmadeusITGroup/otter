import {
  PerformanceMetricService,
} from '@ama-sdk/core';
import type {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
} from '../../fetch-plugin';

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
