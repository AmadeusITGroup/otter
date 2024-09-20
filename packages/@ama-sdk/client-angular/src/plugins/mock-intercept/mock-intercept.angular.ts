import { delay, from, mergeMap } from 'rxjs';
import type { AngularCall, AngularPlugin, AngularPluginContext, PluginObservableRunner } from '../../angular-plugin';
import { CUSTOM_MOCK_OPERATION_ID_HEADER, MockInterceptRequest } from '@ama-sdk/core';
import { HttpResponse } from '@angular/common/http';
import type { MockInterceptAngularParameters } from './mock-intercept.interface';

/**
 * Plugin to mock and intercept the call of SDK
 *
 * This plugin should be used only with the MockInterceptRequest Plugin.
 * It will allow the user to delay the response or to handle the getResponse function provided with the mock (if present).
 */
export class MockInterceptAngular implements AngularPlugin {

  constructor(protected options: MockInterceptAngularParameters) {}

  public load(context: AngularPluginContext): PluginObservableRunner<HttpResponse<any>, AngularCall> {

    if (!context.apiClient.options.requestPlugins.some((plugin) => plugin instanceof MockInterceptRequest)) {
      throw new Error('MockInterceptAngular plugin should be used only with the MockInterceptRequest plugin');
    }

    return {
      transform: (call: AngularCall) => {
        return from((
          async () => {
            await this.options.adapter.initialize();

            let originalCall = call;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            if (!context.options.headers || !(context.options.headers instanceof Headers) || !(context.options.headers as Headers).has(CUSTOM_MOCK_OPERATION_ID_HEADER)) {
              return originalCall;
            }

            if (typeof this.options.delayTiming !== 'undefined') {
              const delayTime = typeof this.options.delayTiming === 'number' ? this.options.delayTiming : await this.options.delayTiming({
                ...context,
                fetchPlugins: [],
                options: context.requestOptions
              });
              originalCall = originalCall.pipe(delay(delayTime));
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
