import type {
  PluginAsyncRunner,
  RequestPlugin,
} from '@ama-sdk/core';
import {
  CUSTOM_MOCK_OPERATION_ID_HEADER,
  MockInterceptRequest,
} from '@ama-sdk/core';
import type {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
  PluginAsyncStarter,
} from '../../fetch-plugin';
import {
  MockInterceptFetchParameters,
} from './mock-intercept.interface';

/**
 * Plugin to mock and intercept the fetch of SDK
 *
 * This plugin should be used only with the MockInterceptRequest Plugin.
 * It will allow the user to delay the response or to handle the getResponse function provided with the mock (if present).
 */
export class MockInterceptFetch implements FetchPlugin {
  constructor(protected options: MockInterceptFetchParameters) {}

  private readonly checkMockInterceptFetchPlugin = (requestPlugins: RequestPlugin[]) => {
    if (!requestPlugins.some((plugin) => plugin instanceof MockInterceptRequest)) {
      throw new Error('MockInterceptFetch plugin should be used only with the MockInterceptRequest plugin');
    }
  };

  public load(context: FetchPluginContext): PluginAsyncRunner<Response, Promise<Response>> & PluginAsyncStarter {
    const requestPlugins = typeof context.apiClient.options.requestPlugins === 'function'
      ? context.apiClient.options.requestPlugins(context.requestOptions)
      : context.apiClient.options.requestPlugins;
    if (Array.isArray(requestPlugins)) {
      this.checkMockInterceptFetchPlugin(requestPlugins);
    }

    return {
      transform: async (fetchCall: FetchCall) => {
        if (!Array.isArray(requestPlugins)) {
          this.checkMockInterceptFetchPlugin(await requestPlugins);
        }
        await this.options.adapter.initialize();

        let responsePromise = fetchCall;
        if (!context.options.headers || !(context.options.headers instanceof Headers) || !context.options.headers.has(CUSTOM_MOCK_OPERATION_ID_HEADER)) {
          return responsePromise;
        }

        if (typeof this.options.delayTiming !== 'undefined') {
          const delay = typeof this.options.delayTiming === 'number' ? this.options.delayTiming : await this.options.delayTiming(context);
          const resp = await responsePromise;
          responsePromise = new Promise<Response>((resolve) => setTimeout(resolve, delay)).then(() => resp);
        }

        const operationId = context.options.headers.get(CUSTOM_MOCK_OPERATION_ID_HEADER)!;
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
