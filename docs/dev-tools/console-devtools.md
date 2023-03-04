# Otter Console DevTools

Otter Framework is exposition function to the browser console to help to debug and configure your application.
All the helpers are exposed under the variable **_OTTER_DEVTOOLS_** accessible via `window._OTTER_DEVTOOLS_`.

Currently the following modules are exposing helpers in the console:

- **Configuration**: display and update the application configuration
- **Localization**: toggle localization key visualization
- **RulesEngine**: display rules engine status information
- **Application**: display application global information

## How to enable the support in your application

You will need to enable the features you need one by one. There is no root toggle.
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
import { ApplicationDevtoolsConsoleService } from '@o3r/application';
import { ConfigurationDevtoolsConsoleService } from '@o3r/configuration';
import { LocalizationDevtoolsConsoleService } from '@o3r/localization';
import { RulesEngineDevtoolsConsoleService } from '@o3r/rules-engine';

@Component({
  selector: 'app'
})
export class AppComponent {
  constructor(
    applicationDevtoolsConsoleService: ApplicationDevtoolsConsoleService,
    configurationConsoleService: ConfigurationDevtoolsConsoleService,
    localizationConsoleService: LocalizationDevtoolsConsoleService,
    rulesEngineDevtoolsConsoleService: RulesEngineDevtoolsConsoleService) {
    this.getStaticConfig();
    if (environment.DEBUG_MODE) {
      // The COnsole Devtools services should be activated only in the development mode
      applicationDevtoolsConsoleService.activate();
      configurationConsoleService.activate();
      localizationConsoleService.activate();
      rulesEngineDevtoolsConsoleService.activate();
    }
  }
}
```

## How to use it

Open the browser console (use `F12` on Chrome) and start to write `window._OTTER_DEVTOOLS_` to access to the different modules' devtools.
