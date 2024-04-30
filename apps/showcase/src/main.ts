import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import '@angular/localize/init';
import { ApplicationRef, enableProdMode, inject, runInInjectionContext } from '@angular/core';
import { ConfigurationDevtoolsConsoleService, ConfigurationDevtoolsMessageService } from '@o3r/configuration';
import { LocalizationDevtoolsConsoleService, LocalizationDevtoolsMessageService } from '@o3r/localization';
import { ApplicationDevtoolsConsoleService, ApplicationDevtoolsMessageService } from '@o3r/application';
import { RulesEngineDevtoolsConsoleService, RulesEngineDevtoolsMessageService } from '@o3r/rules-engine';
import { ComponentsDevtoolsMessageService } from '@o3r/components';
import { StylingDevtoolsMessageService } from '@o3r/styling';
import { environment } from './environments/environment';
import { enableElfProdMode } from '@ngneat/elf';
import { devTools } from '@ngneat/elf-devtools';

document.body.dataset.dynamiccontentpath = localStorage.getItem('dynamicPath') || '';

if (environment.production) {
  enableProdMode();
  enableElfProdMode();
}


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
    devTools({
      postTimelineUpdate: () => m.injector.get(ApplicationRef).tick()
    });
  })
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
