import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import '@angular/localize/init';
import { inject, runInInjectionContext } from '@angular/core';
import { ConfigurationDevtoolsConsoleService } from '@o3r/configuration';
import { LocalizationDevtoolsConsoleService } from '@o3r/localization';

document.body.dataset.dynamiccontentpath = localStorage.getItem('dynamicPath') || '';
platformBrowserDynamic().bootstrapModule(AppModule)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      inject(ConfigurationDevtoolsConsoleService);
      inject(LocalizationDevtoolsConsoleService);
    });
  })
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
