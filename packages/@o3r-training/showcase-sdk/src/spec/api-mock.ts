import {
  ApiFetchClient,
} from '@ama-sdk/client-fetch';
import {
  ApiClient,
  isApiClient,
} from '@ama-sdk/core';
import * as api from '../api';

/**
 * Base path for the mock server
 */
export const MOCK_SERVER_BASE_PATH = 'http://localhost:10010/v2';
const MOCK_SERVER = new ApiFetchClient({ basePath: MOCK_SERVER_BASE_PATH });

export interface Api {
  petApi: api.PetApi;
  storeApi: api.StoreApi;
  userApi: api.UserApi;
}

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
export function getMockedApi(apiClient: ApiClient): Api {
  return {
    petApi: new api.PetApi(apiClient),
    storeApi: new api.StoreApi(apiClient),
    userApi: new api.UserApi(apiClient)
  };
}
