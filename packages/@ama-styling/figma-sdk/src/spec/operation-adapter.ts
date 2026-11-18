import type {
  PathObject,
} from '@ama-sdk/core';

/* eslint-disable max-len */
export const OPERATION_ADAPTER: PathObject[] = [
  {
    path: '/v1/files/{file_key}',
    urlPattern: '/v1/files/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFile'},
    ]
  },
  {
    path: '/v1/files/{file_key}/nodes',
    urlPattern: '/v1/files/((?:[^/]+?))/nodes(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/nodes(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFileNodes'},
    ]
  },
  {
    path: '/v1/images/{file_key}',
    urlPattern: '/v1/images/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/images/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getImages'},
    ]
  },
  {
    path: '/v1/files/{file_key}/images',
    urlPattern: '/v1/files/((?:[^/]+?))/images(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/images(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getImageFills'},
    ]
  },
  {
    path: '/v1/files/{file_key}/meta',
    urlPattern: '/v1/files/((?:[^/]+?))/meta(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/meta(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFileMeta'},
    ]
  },
  {
    path: '/v1/teams/{team_id}/projects',
    urlPattern: '/v1/teams/((?:[^/]+?))/projects(?:/(?=$))?$',
    regexp: new RegExp('^/v1/teams/((?:[^/]+?))/projects(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getTeamProjects'},
    ]
  },
  {
    path: '/v1/projects/{project_id}/files',
    urlPattern: '/v1/projects/((?:[^/]+?))/files(?:/(?=$))?$',
    regexp: new RegExp('^/v1/projects/((?:[^/]+?))/files(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getProjectFiles'},
    ]
  },
  {
    path: '/v1/files/{file_key}/versions',
    urlPattern: '/v1/files/((?:[^/]+?))/versions(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/versions(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFileVersions'},
    ]
  },
  {
    path: '/v1/files/{file_key}/comments',
    urlPattern: '/v1/files/((?:[^/]+?))/comments(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/comments(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getComments'},
      {method: 'post', operationId: 'postComment'},
    ]
  },
  {
    path: '/v1/files/{file_key}/comments/{comment_id}',
    urlPattern: '/v1/files/((?:[^/]+?))/comments/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/comments/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'delete', operationId: 'deleteComment'},
    ]
  },
  {
    path: '/v1/files/{file_key}/comments/{comment_id}/reactions',
    urlPattern: '/v1/files/((?:[^/]+?))/comments/((?:[^/]+?))/reactions(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/comments/((?:[^/]+?))/reactions(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getCommentReactions'},
      {method: 'post', operationId: 'postCommentReaction'},
      {method: 'delete', operationId: 'deleteCommentReaction'},
    ]
  },
  {
    path: '/v1/me',
    urlPattern: '/v1/me(?:/(?=$))?$',
    regexp: new RegExp('^/v1/me(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getMe'},
    ]
  },
  {
    path: '/v1/teams/{team_id}/components',
    urlPattern: '/v1/teams/((?:[^/]+?))/components(?:/(?=$))?$',
    regexp: new RegExp('^/v1/teams/((?:[^/]+?))/components(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getTeamComponents'},
    ]
  },
  {
    path: '/v1/files/{file_key}/components',
    urlPattern: '/v1/files/((?:[^/]+?))/components(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/components(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFileComponents'},
    ]
  },
  {
    path: '/v1/components/{key}',
    urlPattern: '/v1/components/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/components/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getComponent'},
    ]
  },
  {
    path: '/v1/teams/{team_id}/component_sets',
    urlPattern: '/v1/teams/((?:[^/]+?))/component_sets(?:/(?=$))?$',
    regexp: new RegExp('^/v1/teams/((?:[^/]+?))/component_sets(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getTeamComponentSets'},
    ]
  },
  {
    path: '/v1/files/{file_key}/component_sets',
    urlPattern: '/v1/files/((?:[^/]+?))/component_sets(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/component_sets(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFileComponentSets'},
    ]
  },
  {
    path: '/v1/component_sets/{key}',
    urlPattern: '/v1/component_sets/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/component_sets/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getComponentSet'},
    ]
  },
  {
    path: '/v1/teams/{team_id}/styles',
    urlPattern: '/v1/teams/((?:[^/]+?))/styles(?:/(?=$))?$',
    regexp: new RegExp('^/v1/teams/((?:[^/]+?))/styles(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getTeamStyles'},
    ]
  },
  {
    path: '/v1/files/{file_key}/styles',
    urlPattern: '/v1/files/((?:[^/]+?))/styles(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/styles(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getFileStyles'},
    ]
  },
  {
    path: '/v1/styles/{key}',
    urlPattern: '/v1/styles/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/styles/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getStyle'},
    ]
  },
  {
    path: '/v2/webhooks',
    urlPattern: '/v2/webhooks(?:/(?=$))?$',
    regexp: new RegExp('^/v2/webhooks(?:/(?=$))?$'),
    operations: [
      {method: 'post', operationId: 'postWebhook'},
    ]
  },
  {
    path: '/v2/webhooks/{webhook_id}',
    urlPattern: '/v2/webhooks/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v2/webhooks/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getWebhook'},
      {method: 'put', operationId: 'putWebhook'},
      {method: 'delete', operationId: 'deleteWebhook'},
    ]
  },
  {
    path: '/v2/teams/{team_id}/webhooks',
    urlPattern: '/v2/teams/((?:[^/]+?))/webhooks(?:/(?=$))?$',
    regexp: new RegExp('^/v2/teams/((?:[^/]+?))/webhooks(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getTeamWebhooks'},
    ]
  },
  {
    path: '/v2/webhooks/{webhook_id}/requests',
    urlPattern: '/v2/webhooks/((?:[^/]+?))/requests(?:/(?=$))?$',
    regexp: new RegExp('^/v2/webhooks/((?:[^/]+?))/requests(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getWebhookRequests'},
    ]
  },
  {
    path: '/v1/activity_logs',
    urlPattern: '/v1/activity_logs(?:/(?=$))?$',
    regexp: new RegExp('^/v1/activity_logs(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getActivityLogs'},
    ]
  },
  {
    path: '/v1/payments',
    urlPattern: '/v1/payments(?:/(?=$))?$',
    regexp: new RegExp('^/v1/payments(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getPayments'},
    ]
  },
  {
    path: '/v1/files/{file_key}/variables/local',
    urlPattern: '/v1/files/((?:[^/]+?))/variables/local(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/variables/local(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLocalVariables'},
    ]
  },
  {
    path: '/v1/files/{file_key}/variables/published',
    urlPattern: '/v1/files/((?:[^/]+?))/variables/published(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/variables/published(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getPublishedVariables'},
    ]
  },
  {
    path: '/v1/files/{file_key}/variables',
    urlPattern: '/v1/files/((?:[^/]+?))/variables(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/variables(?:/(?=$))?$'),
    operations: [
      {method: 'post', operationId: 'postVariables'},
    ]
  },
  {
    path: '/v1/files/{file_key}/dev_resources',
    urlPattern: '/v1/files/((?:[^/]+?))/dev_resources(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/dev_resources(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getDevResources'},
    ]
  },
  {
    path: '/v1/dev_resources',
    urlPattern: '/v1/dev_resources(?:/(?=$))?$',
    regexp: new RegExp('^/v1/dev_resources(?:/(?=$))?$'),
    operations: [
      {method: 'put', operationId: 'putDevResources'},
      {method: 'post', operationId: 'postDevResources'},
    ]
  },
  {
    path: '/v1/files/{file_key}/dev_resources/{dev_resource_id}',
    urlPattern: '/v1/files/((?:[^/]+?))/dev_resources/((?:[^/]+?))(?:/(?=$))?$',
    regexp: new RegExp('^/v1/files/((?:[^/]+?))/dev_resources/((?:[^/]+?))(?:/(?=$))?$'),
    operations: [
      {method: 'delete', operationId: 'deleteDevResource'},
    ]
  },
  {
    path: '/v1/analytics/libraries/{file_key}/component/actions',
    urlPattern: '/v1/analytics/libraries/((?:[^/]+?))/component/actions(?:/(?=$))?$',
    regexp: new RegExp('^/v1/analytics/libraries/((?:[^/]+?))/component/actions(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLibraryAnalyticsComponentActions'},
    ]
  },
  {
    path: '/v1/analytics/libraries/{file_key}/component/usages',
    urlPattern: '/v1/analytics/libraries/((?:[^/]+?))/component/usages(?:/(?=$))?$',
    regexp: new RegExp('^/v1/analytics/libraries/((?:[^/]+?))/component/usages(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLibraryAnalyticsComponentUsages'},
    ]
  },
  {
    path: '/v1/analytics/libraries/{file_key}/style/actions',
    urlPattern: '/v1/analytics/libraries/((?:[^/]+?))/style/actions(?:/(?=$))?$',
    regexp: new RegExp('^/v1/analytics/libraries/((?:[^/]+?))/style/actions(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLibraryAnalyticsStyleActions'},
    ]
  },
  {
    path: '/v1/analytics/libraries/{file_key}/style/usages',
    urlPattern: '/v1/analytics/libraries/((?:[^/]+?))/style/usages(?:/(?=$))?$',
    regexp: new RegExp('^/v1/analytics/libraries/((?:[^/]+?))/style/usages(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLibraryAnalyticsStyleUsages'},
    ]
  },
  {
    path: '/v1/analytics/libraries/{file_key}/variable/actions',
    urlPattern: '/v1/analytics/libraries/((?:[^/]+?))/variable/actions(?:/(?=$))?$',
    regexp: new RegExp('^/v1/analytics/libraries/((?:[^/]+?))/variable/actions(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLibraryAnalyticsVariableActions'},
    ]
  },
  {
    path: '/v1/analytics/libraries/{file_key}/variable/usages',
    urlPattern: '/v1/analytics/libraries/((?:[^/]+?))/variable/usages(?:/(?=$))?$',
    regexp: new RegExp('^/v1/analytics/libraries/((?:[^/]+?))/variable/usages(?:/(?=$))?$'),
    operations: [
      {method: 'get', operationId: 'getLibraryAnalyticsVariableUsages'},
    ]
  },
];
/* eslint-enable max-len */
