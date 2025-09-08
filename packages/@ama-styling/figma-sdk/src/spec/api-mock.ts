import { type ApiClient } from '@ama-sdk/core';

import * as api from '../api';

/**
 * Base path for the mock server
 */
export const MOCK_SERVER_BASE_PATH = 'http://localhost:10010/v2';

export interface Api {
  activityLogsApi: api.ActivityLogsApi;
  commentReactionsApi: api.CommentReactionsApi;
  commentsApi: api.CommentsApi;
  componentSetsApi: api.ComponentSetsApi;
  componentsApi: api.ComponentsApi;
  devResourcesApi: api.DevResourcesApi;
  filesApi: api.FilesApi;
  libraryAnalyticsApi: api.LibraryAnalyticsApi;
  paymentsApi: api.PaymentsApi;
  projectsApi: api.ProjectsApi;
  stylesApi: api.StylesApi;
  usersApi: api.UsersApi;
  variablesApi: api.VariablesApi;
  webhooksApi: api.WebhooksApi;
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
    activityLogsApi: new api.ActivityLogsApi(apiClient),
    commentReactionsApi: new api.CommentReactionsApi(apiClient),
    commentsApi: new api.CommentsApi(apiClient),
    componentSetsApi: new api.ComponentSetsApi(apiClient),
    componentsApi: new api.ComponentsApi(apiClient),
    devResourcesApi: new api.DevResourcesApi(apiClient),
    filesApi: new api.FilesApi(apiClient),
    libraryAnalyticsApi: new api.LibraryAnalyticsApi(apiClient),
    paymentsApi: new api.PaymentsApi(apiClient),
    projectsApi: new api.ProjectsApi(apiClient),
    stylesApi: new api.StylesApi(apiClient),
    usersApi: new api.UsersApi(apiClient),
    variablesApi: new api.VariablesApi(apiClient),
    webhooksApi: new api.WebhooksApi(apiClient)
  };
}
