/* eslint-disable @typescript-eslint/naming-convention */
const currentPackage = {
  newPackage: '@ama-sdk/client-fetch'
};

export const mapMigrationFromCoreImports = {
  '@ama-sdk/core': [
    'FetchCall',
    'FetchPluginContext',
    'PluginAsyncStarter',
    'FetchPlugin',
    'BaseApiFetchClientOptions',
    'BaseApiFetchClientConstructor',
    'ApiFetchClient',
    'AbortCallback',
    'AbortFetch',
    'ConcurrentFetch',
    'KeepaliveRequest',
    'MockInterceptFetch',
    'MockInterceptFetchParameters',
    'Mark',
    'PerformanceMetricOptions',
    'PerformanceMetricPlugin',
    'RetryConditionType',
    'RetryFetch',
    'TimeoutStatus',
    'TimeoutPauseEventHandler',
    'TimeoutPauseEventHandlerFactory',
    'impervaCaptchaEventHandlerFactory',
    'TimeoutFetch',
    'CallbackFunction',
    'CanStartConditionResult',
    'CanStartConditionFunction',
    'WaitForFetch'
  ].reduce((acc, name) => ({...acc, [name]: currentPackage}), {} as Record<string, typeof currentPackage>)
};
