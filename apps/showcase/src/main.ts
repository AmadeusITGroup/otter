import {
  inject,
  runInInjectionContext
} from '@angular/core';
import {
  platformBrowserDynamic
} from '@angular/platform-browser-dynamic';
import {
  ApplicationDevtoolsConsoleService,
  ApplicationDevtoolsMessageService
} from '@o3r/application';
import {
  ComponentsDevtoolsMessageService
} from '@o3r/components';
import {
  ConfigurationDevtoolsConsoleService,
  ConfigurationDevtoolsMessageService
} from '@o3r/configuration';
import {
  LocalizationDevtoolsConsoleService,
  LocalizationDevtoolsMessageService
} from '@o3r/localization';
import {
  RulesEngineDevtoolsConsoleService,
  RulesEngineDevtoolsMessageService
} from '@o3r/rules-engine';
import {
  StylingDevtoolsMessageService
} from '@o3r/styling';
import {
  AppModule
} from './app/app.module';
import '@angular/localize/init';

document.body.dataset.dynamiccontentpath = localStorage.getItem('dynamicPath') || '';
platformBrowserDynamic().bootstrapModule(AppModule)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      inject(ApplicationDevtoolsConsoleService);
      inject(ApplicationDevtoolsMessageService);
      inject(RulesEngineDevtoolsConsoleService);
      inject(RulesEngineDevtoolsMessageService);
      inject(ConfigurationDevtoolsConsoleService);
      inject(ConfigurationDevtoolsMessageService);
      inject(LocalizationDevtoolsConsoleService);
      inject(LocalizationDevtoolsMessageService);
      inject(ComponentsDevtoolsMessageService);
      inject(StylingDevtoolsMessageService);
    });
  })
  // eslint-disable-next-line no-console -- only logger available
  .catch((err) => console.error(err));
