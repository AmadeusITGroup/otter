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
        const mockData: Pet[] = [{ name : "mockPetName", photoUrls: ["mockPhotoUrl"], status: "available"}];
        const text = JSON.stringify(mockData);
        const blob = new Blob([text], { type: 'application/json' });
        const basePath = URL.createObjectURL(blob);

        return {
          method: 'GET',
          basePath,
          headers: new Headers()
        };
      }
    };
  }
}

function petApiFactory() {
  const apiFetchClient = new ApiFetchClient(
    {
      basePath: 'https://petstore3.swagger.io/api/v3',
      requestPlugins: [new MockInterceptRequest()],
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
