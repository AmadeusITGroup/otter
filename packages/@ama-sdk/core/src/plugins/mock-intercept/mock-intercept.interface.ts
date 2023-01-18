import { MockAdapter } from '../../fwk/index';
import { FetchPluginContext, RequestOptions } from '../core/index';

/** Mock Fetch Plugin options */
export interface MockInterceptFetchParameters {
  /** List of mocks to be used */
  adapter: MockAdapter;
  /** Delays the mock response, in milliseconds */
  delayTiming?: number | ((context: FetchPluginContext) => number | Promise<number>);
}

/** Mock Request Plugin options */
export interface MockInterceptRequestParameters {
  /** List of mocks to be used */
  adapter: MockAdapter;
  /** Disables the interception */
  disabled: boolean;
  /** Decides if the request should be intercepted or not */
  filter: (request: RequestOptions) => boolean;
}

/** Custom Mock Header for Operation ID */
export const CUSTOM_MOCK_OPERATION_ID_HEADER = 'X-mock-operation-id';

/** Custom Mock Header for Original Request */
export const CUSTOM_MOCK_REQUEST_HEADER = 'X-mock-request';
