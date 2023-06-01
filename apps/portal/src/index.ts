import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import {AppModule} from './app/index';
import {environment} from './environments/index';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => platformBrowserDynamic().bootstrapModule(AppModule));
