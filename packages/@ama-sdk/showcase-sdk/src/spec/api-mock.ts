import { ApiClient, isApiClient } from '@ama-sdk/core';
import { ApiFetchClient, BaseApiFetchClientConstructor } from '@ama-sdk/client-fetch';

import * as api from '../api';

const MOCK_SERVER_BASE_PATH = 'http://localhost:10010/v2';
const MOCK_SERVER = new ApiFetchClient({basePath: MOCK_SERVER_BASE_PATH});

export interface Api {
  petApi: api.PetApi;
  storeApi: api.StoreApi;
  userApi: api.UserApi;
}

export const myApi: Api = {
  petApi: new api.PetApi(MOCK_SERVER),
  storeApi: new api.StoreApi(MOCK_SERVER),
  userApi: new api.UserApi(MOCK_SERVER)
};


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
    petApi: new api.PetApi(apiConfigObj),
    storeApi: new api.StoreApi(apiConfigObj),
    userApi: new api.UserApi(apiConfigObj)
  };
}
