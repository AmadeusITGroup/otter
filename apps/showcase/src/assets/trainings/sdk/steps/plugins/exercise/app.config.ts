import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { PluginRunner, RequestOptions, RequestPlugin } from '@ama-sdk/core';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Pet, PetApi } from 'sdk';
import { routes } from './app.routes';

class MockInterceptRequest implements RequestPlugin {
  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async () => {
        // TODO Create a mock response of type Pet[]
        // TODO Store the stringified object in a Blob and create an object URL
        // TODO Replace the original base path with the URL of the Blob
        const basePath = '/target your blob resource/';

        return {
          method: 'GET',
          headers: new Headers(),
          basePath
        }
      }
    };
  }
}

// TODO Add your plugin to the Api Fetch Client
function petApiFactory() {
  const apiFetchClient = new ApiFetchClient(
    {
      basePath: 'https://petstore3.swagger.io/api/v3',
      requestPlugins: [],
      replyPlugins: [],
      fetchPlugins: []
    }
  );
  return new PetApi(apiFetchClient);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {provide: PetApi, useFactory: petApiFactory}
  ]
};
