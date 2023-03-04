# Otter Chrome DevTools

Otter Framework is providing a Chrome DevTools extension for your applications.
The extension comes with the following features:

- **Application information**: Application version, environment, build date, etc.
- **Location key display**
- **Visual Testing toggle**
- **Rule Engine current state**: Rule engine state, rule engine logs, etc.
- **Configuration**: display and modification of the application components configuration.

## How to enable the extension support in your application

Once you have download the extension, you will need to enable the features you need one by one. There is no root toggle.
To do so, you will need to import the corresponding modules in you AppModule:

```typescript

import { ApplicationDevtoolsModule } from '@o3r/application';
import { ConfigurationDevtoolsModule } from '@o3r/configuration';
import { LocalizationDevtoolsModule } from '@o3r/localization';
import { RulesEngineDevtoolsModule } from '@o3r/rules-engine';

@NgModule({
  imports: [
    ApplicationDevtoolsModule,
    ConfigurationDevtoolsModule,
    LocalizationDevtoolsModule,
    RulesEngineDevtoolsModule
  ]
})
export class AppModule {
}

```

Then the services activation can be done in the AppComponent as following:

```typescript
import { 
  ApplicationDevtoolsMessageService,
  ComponentsDevtoolsMessageService,
  ConfigurationDevtoolsMessageService,
  LocalizationDevtoolsMessageService,
  RulesEngineDevtoolsMessageService
} from '@o3r/chrome-devtools';

@Component({
  selector: 'app'
})
export class AppComponent {
  constructor(
    applicationDevtoolsMessageService: ApplicationDevtoolsMessageService,
    componentsDevtoolsMessageService: ComponentsDevtoolsMessageService,
    configurationMessageService: ConfigurationDevtoolsMessageService,
    localizationMessageService: LocalizationDevtoolsMessageService,
    rulesEngineDevtoolsMessageService: RulesEngineDevtoolsMessageService) {
    this.getStaticConfig();
    if (environment.DEBUG_MODE) {
      // The Otter Devtools services should be activated only in the development mode
      applicationDevtoolsMessageService.activate();
      componentsDevtoolsMessageService.activate();
      configurationMessageService.activate();
      localizationMessageService.activate();
      rulesEngineDevtoolsMessageService.activate();
    }
  }
}
```

## How to install the application

Currently the extension is available only in the **Chrome browser**. You can download it from the [Google Web Store](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne).
