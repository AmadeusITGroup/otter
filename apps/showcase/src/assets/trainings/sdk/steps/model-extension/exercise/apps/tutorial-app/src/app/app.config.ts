import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { MockInterceptRequest, SequentialMockAdapter } from '@ama-sdk/core';
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ConsoleLogger, Logger, LOGGER_CLIENT_TOKEN, LoggerService } from '@o3r/logger';
import { DummyApi } from 'sdk';
import { OPERATION_ADAPTER } from 'sdk/spec';
import { routes } from './app.routes';
import { additionalModules } from '../environments/environment';

function dummyApiFactory(logger: Logger) {
  const apiConfig = new ApiFetchClient(
    {
      basePath: 'http://localhost:3000',
      requestPlugins: [
        new MockInterceptRequest({
          adapter: new SequentialMockAdapter(
            OPERATION_ADAPTER,
            {
              'dummyGet': [{
                mockData: {
                  originLocationCode: 'PAR',
                  destinationLocationCode: 'NYC'
                }
              }]
            }
          )
        })
      ],
      fetchPlugins: [],
      logger
    }
  );
  return new DummyApi(apiConfig);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(additionalModules),
    {provide: LOGGER_CLIENT_TOKEN, useValue: new ConsoleLogger()},
    {provide: DummyApi, useFactory: dummyApiFactory, deps: [LoggerService]}
  ]
};
