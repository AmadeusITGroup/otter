import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { PetApi } from 'sdk';
import { routes } from './app.routes';


function petApiFactory() {
  /* Create an ApiFetchClient and return a PetApi object */
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {provide: PetApi, useFactory: petApiFactory}
  ]
};
