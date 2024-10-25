import {
  PluginRunner,
  RequestOptions,
  RequestPlugin
} from '../core';
import {
  CUSTOM_MOCK_OPERATION_ID_HEADER,
  CUSTOM_MOCK_REQUEST_HEADER,
  MockInterceptFetchParameters,
  MockInterceptRequestParameters
} from './mock-intercept.interface';

/**
 * Plugin to intercept an API request for mock purposes
 */
export class MockInterceptRequest implements RequestPlugin {
  protected options: MockInterceptRequestParameters;

  /**
   * Creates a new instance of the plugin
   * @param options configuration options for the plugin
   */
  constructor(options: Partial<MockInterceptRequestParameters> & MockInterceptFetchParameters) {
    this.options = {
      disabled: false,
      filter: () => true,
      ...options
    };
  }

  /** @inheritdoc */
  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        await this.options.adapter.initialize();

        if (
          this.options.disabled
          // eslint-disable-next-line unicorn/no-array-callback-reference -- filter is not an array callback here
          || (this.options.filter && !this.options.filter(data))
        ) {
          return data;
        }

        const requestOption = {
          ...data,
          method: data.method || 'GET'
        };
        delete requestOption.api;

        const operationId = await this.options.adapter.retrieveOperationId(requestOption);
        const mock = this.options.adapter.getMock(operationId);
        const text = JSON.stringify(mock.mockData);
        const blob = new Blob([text], { type: 'application/json' });
        const basePath = URL.createObjectURL(blob);
        const headers = data.headers || new Headers();
        data.headers.append(CUSTOM_MOCK_OPERATION_ID_HEADER, operationId);
        data.headers.append(CUSTOM_MOCK_REQUEST_HEADER, JSON.stringify(requestOption));

        return {
          method: 'GET',
          basePath,
          headers
        };
      }
    };
  }
}
