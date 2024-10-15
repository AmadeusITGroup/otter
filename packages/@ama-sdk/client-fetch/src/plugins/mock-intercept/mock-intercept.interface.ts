import type { MockAdapter } from '@ama-sdk/core';
import type { FetchPluginContext } from '../../fetch-plugin';

/** Mock Fetch Plugin options */
export interface MockInterceptFetchParameters {
  /** List of mocks to be used */
  adapter: MockAdapter;
  /** Delays the mock response, in milliseconds */
  delayTiming?: number | ((context: FetchPluginContext) => number | Promise<number>);
}
