import {
  CUSTOM_MOCK_OPERATION_ID_HEADER,
  MockInterceptRequest,
  RequestPlugin,
} from '@ama-sdk/core';
import {
  HttpResponse,
} from '@angular/common/http';
import {
  delay,
  from,
  mergeMap,
} from 'rxjs';
import type {
  AngularCall,
  AngularPlugin,
  AngularPluginContext,
  PluginObservableRunner,
} from '../../angular-plugin';
import type {
  MockInterceptAngularParameters,
} from './mock-intercept-interface';

/**
 * Plugin to mock and intercept the call of SDK
 *
 * This plugin should be used only with the MockInterceptRequest Plugin.
 * It will allow the user to delay the response or to handle the getResponse function provided with the mock (if present).
 */
export class MockInterceptAngular implements AngularPlugin {
  constructor(protected options: MockInterceptAngularParameters) {}

  private readonly checkMockInterceptAngularPlugin = (requestPlugins: RequestPlugin[]) => {
    if (!requestPlugins.some((plugin) => plugin instanceof MockInterceptRequest)) {
      throw new Error('MockInterceptAngular plugin should be used only with the MockInterceptRequest plugin');
    }
  };

  public load(context: AngularPluginContext): PluginObservableRunner<HttpResponse<any>, AngularCall> {
    const requestPlugins = typeof context.apiClient.options.requestPlugins === 'function'
      ? context.apiClient.options.requestPlugins(context.requestOptions)
      : context.apiClient.options.requestPlugins;
    if (Array.isArray(requestPlugins)) {
      this.checkMockInterceptAngularPlugin(requestPlugins);
    }

    return {
      transform: (call: AngularCall) => {
        return from((
          async () => {
            if (!Array.isArray(requestPlugins)) {
              this.checkMockInterceptAngularPlugin(await requestPlugins);
            }
            await this.options.adapter.initialize();

            let originalCall = call;

            if (!context.options.headers || !(context.options.headers instanceof Headers) || !(context.options.headers as Headers).has(CUSTOM_MOCK_OPERATION_ID_HEADER)) {
              return originalCall;
            }

            if (typeof this.options.delayTiming !== 'undefined') {
              const delayTime = typeof this.options.delayTiming === 'number'
                ? this.options.delayTiming
                : await this.options.delayTiming({
                  ...context,
                  fetchPlugins: [],
                  options: context.requestOptions
                });
              originalCall = originalCall.pipe(delay(delayTime));
            }

            const operationId = (context.options.headers as Headers).get(CUSTOM_MOCK_OPERATION_ID_HEADER)!;
            try {
              const mock = this.options.adapter.getLatestMock(operationId);

              if (!mock.getResponse) {
                return originalCall;
              }

              const response = mock.getResponse();
              return originalCall.pipe(
                mergeMap(async (res) => {
                  const body = await response.json();
                  const responseCloned = res.clone();
                  return new HttpResponse<any>({
                    ...responseCloned,
                    body,
                    url: responseCloned.url || undefined
                  });
                })
              );
            } catch {
              (context.logger || console).error(`Failed to retrieve the latest mock for Operation ID ${operationId}, fallback to default mock`);
              return originalCall;
            }
          })()
        ).pipe(mergeMap((res) => res));
      }
    };
  }
}
