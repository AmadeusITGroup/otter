import {
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  bootstrapApplication,
} from '@angular/platform-browser';
import {
  App,
} from './app-components/app';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection()
  ]
})
  // eslint-disable-next-line no-console -- only logger available
  .catch((err) => console.error(err));
