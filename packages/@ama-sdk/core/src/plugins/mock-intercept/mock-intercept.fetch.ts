import { FetchCall, FetchPlugin, FetchPluginContext, PluginAsyncRunner, PluginAsyncStarter } from '../core';
import { CUSTOM_MOCK_OPERATION_ID_HEADER, MockInterceptFetchParameters } from './mock-intercept.interface';
import { MockInterceptRequest } from './mock-intercept.request';

/**
 * Plugin to mock and intercept the fetch of SDK
 *
 * This plugin should be used only with the MockInterceptRequest Plugin.
 * It will allow the user to delay the response or to handle the getResponse function provided with the mock (if present).
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (!context.options.headers || !(context.options.headers instanceof Headers) || !(context.options.headers as Headers).has(CUSTOM_MOCK_OPERATION_ID_HEADER)) {
          return responsePromise;
        }

        if (typeof this.options.delayTiming !== 'undefined') {
          const delay = typeof this.options.delayTiming === 'number' ? this.options.delayTiming : await this.options.delayTiming(context);
          const resp = await responsePromise;
          responsePromise = new Promise<Response>((resolve) => setTimeout(resolve, delay)).then(() => resp);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const operationId = (context.options.headers as Headers).get(CUSTOM_MOCK_OPERATION_ID_HEADER)!;
        try {
          const mock = this.options.adapter.getLatestMock(operationId);

          if (!mock.getResponse) {
            return responsePromise;
          }

          const response = mock.getResponse();
          return responsePromise.then(() => response);

        } catch {
          // eslint-disable-next-line no-console
          console.error(`Failed to retrieve the latest mock for Operation ID ${operationId}, fallback to default mock`);
          return responsePromise;
        }
      }
    };
  }

}
