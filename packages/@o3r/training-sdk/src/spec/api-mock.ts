import { ApiClient, ApiFetchClient, BaseApiFetchClientConstructor, isApiClient } from '@ama-sdk/core';

import * as api from '../api';

const MOCK_SERVER_BASE_PATH = 'http://localhost:10010/v2';
const MOCK_SERVER = new ApiFetchClient({basePath: MOCK_SERVER_BASE_PATH});

export interface Api {
  dummyApi: api.DummyApi;
}

export const myApi: Api = {
  dummyApi: new api.DummyApi(MOCK_SERVER)
};


/**
 * Retrieve mocked SDK Apis
 *
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
