import {
  StylingDevtoolsMessageService,
} from '@ama-styling/devkit';
import {
  inject,
  runInInjectionContext,
} from '@angular/core';
import {
  bootstrapApplication,
} from '@angular/platform-browser';
import {
  ApplicationDevtoolsConsoleService,
  ApplicationDevtoolsMessageService,
} from '@o3r/application';
import {
  ComponentsDevtoolsMessageService,
} from '@o3r/components';
import {
  ConfigurationDevtoolsConsoleService,
  ConfigurationDevtoolsMessageService,
} from '@o3r/configuration';
import {
  RulesEngineDevtoolsConsoleService,
  RulesEngineDevtoolsMessageService,
} from '@o3r/rules-engine';
import {
  LocalizationDevtoolsConsoleService,
  LocalizationDevtoolsMessageService,
} from '@o3r/transloco';
import {
  App,
} from './app/app';
import {
  appConfig,
} from './app/app.config';

document.body.dataset.dynamiccontentpath = localStorage.getItem('dynamicPath') || '';
bootstrapApplication(App, appConfig)
  .then(({ injector }) => {
    runInInjectionContext(injector, () => {
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
