import type {
  MockAdapter,
} from '@ama-sdk/core';
import type {
  AngularPluginContext,
} from '../../angular-plugin';

/**
 * Mock Angular Plugin options
 */
export interface MockInterceptAngularParameters {
  /** List of mocks to be used */
  adapter: MockAdapter;
  /** Delays the mock response, in milliseconds */
  delayTiming?: number | ((context: AngularPluginContext) => number | Promise<number>);
}
