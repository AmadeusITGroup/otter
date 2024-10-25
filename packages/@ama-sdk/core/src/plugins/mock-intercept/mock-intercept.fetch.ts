import {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
  PluginAsyncRunner,
  PluginAsyncStarter
} from '../core';
import {
  CUSTOM_MOCK_OPERATION_ID_HEADER,
  MockInterceptFetchParameters
} from './mock-intercept.interface';
import {
  MockInterceptRequest
} from './mock-intercept.request';

/**
 * Plugin to mock and intercept the fetch of SDK
 *
 * This plugin should be used only with the MockInterceptRequest Plugin.
 * It will allow the user to delay the response or to handle the getResponse function provided with the mock (if present).
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export class MockInterceptFetch implements FetchPlugin {
  constructor(protected options: MockInterceptFetchParameters) {}

  public load(context: FetchPluginContext): PluginAsyncRunner<Response, Promise<Response>> & PluginAsyncStarter {
    if (!context.apiClient.options.requestPlugins.some((plugin) => plugin instanceof MockInterceptRequest)) {
      throw new Error('MockInterceptFetch plugin should be used only with the MockInterceptRequest plugin');
    }

    return {
      transform: async (fetchCall: FetchCall) => {
        await this.options.adapter.initialize();

        let responsePromise = fetchCall;
        if (!context.options.headers || !(context.options.headers instanceof Headers) || !(context.options.headers).has(CUSTOM_MOCK_OPERATION_ID_HEADER)) {
          return responsePromise;
        }

        if (typeof this.options.delayTiming !== 'undefined') {
          const delay = typeof this.options.delayTiming === 'number' ? this.options.delayTiming : await this.options.delayTiming(context);
          const resp = await responsePromise;
          responsePromise = new Promise<Response>((resolve) => setTimeout(resolve, delay)).then(() => resp);
        }

        const operationId = (context.options.headers).get(CUSTOM_MOCK_OPERATION_ID_HEADER)!;
        try {
          const mock = this.options.adapter.getLatestMock(operationId);

          if (!mock.getResponse) {
            return responsePromise;
          }

          const response = mock.getResponse();
          return responsePromise.then(() => response);
        } catch {
          (context.logger || console).error(`Failed to retrieve the latest mock for Operation ID ${operationId}, fallback to default mock`);
          return responsePromise;
        }
      }
    };
  }
}
