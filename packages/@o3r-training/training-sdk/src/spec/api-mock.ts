import { type ApiClient, isApiClient } from '@ama-sdk/core';
import { ApiFetchClient, type BaseApiFetchClientConstructor } from '@ama-sdk/core';

import * as api from '../api';

/**
 * Base path for the mock server
 */
export const MOCK_SERVER_BASE_PATH = 'http://localhost:10010/v2';
const MOCK_SERVER = new ApiFetchClient({basePath: MOCK_SERVER_BASE_PATH});

export interface Api {
  dummyApi: api.DummyApi;
}

/**
 * Mock APIs
 * @deprecated use `getMockedApi` with {@link ApiClient} instead, will be removed in v12.
 */
export const myApi: Api = {
  dummyApi: new api.DummyApi(MOCK_SERVER)
};

/**
 * Retrieve mocked SDK Apis
 * @param config configuration of the Api Client
 * @deprecated use `getMockedApi` with {@link ApiClient} instead, will be removed in v12.
 */
export function getMockedApi(config?: string | BaseApiFetchClientConstructor): Api;
/**
 * Retrieve mocked SDK Apis
 * @param apiClient Api Client instance
 * @example Default Mocked API usage
 * ```typescript
 * import { getMockedApi, MOCK_SERVER_BASE_PATH } from '@my/sdk/spec';
 * import { ApiFetchClient } from '@ama-sdk/client-fetch';
 * const mocks = getMockedApi(new ApiFetchClient({ basePath: MOCK_SERVER_BASE_PATH }));
 * ```
 */
export function getMockedApi(apiClient: ApiClient): Api;
/**
 * Retrieve mocked SDK Apis
 * @param config configuration of the Api Client
 */
export function getMockedApi(config?: string | BaseApiFetchClientConstructor | ApiClient): Api {
  let apiConfigObj: ApiClient = MOCK_SERVER;
  if (typeof config === 'string') {
    apiConfigObj = new ApiFetchClient({basePath: config});
  } else if (isApiClient(config)) {
    apiConfigObj = config;
  } else if (config) {
    apiConfigObj = new ApiFetchClient(config);
  }
  return {
    dummyApi: new api.DummyApi(apiConfigObj)
  };
}
