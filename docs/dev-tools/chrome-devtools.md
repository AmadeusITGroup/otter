# Otter Chrome DevTools

Otter Framework is providing an [Otter Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) for your applications.
The extension comes with the following features:

- **Application information**: Application version, environment, build date, etc.
- **Location key display**
- **Visual Testing toggle**
- **Rule Engine current state**: Rule engine state, rule engine logs, etc.
- **Configuration**: display and modification of the application components configuration.

## How to enable auto package registration

The Otter module will automatically register its Devtool service if the following configuration is set in the workspace configuration:

```json
{
  "schematics": {
    "*:ng-add": {
      "registerDevtool": true
    }
  }
}
```

> [!NOTE]
> This options is set by the `--with-devtool` options of the `ng add @o3r/core` command.

## How to enable manually the extension support in your application

Once you have download the extension, you will need to enable the features you need one by one. There is no root toggle.
To do so, you will need to import the corresponding modules in you AppModule:

```typescript

import { ApplicationDevtoolsModule } from '@o3r/application';
import { ComponentsDevtoolsModule } from '@o3r/components';
import { ConfigurationDevtoolsModule } from '@o3r/configuration';
import { LocalizationDevtoolsModule } from '@o3r/localization';
import { RulesEngineDevtoolsModule } from '@o3r/rules-engine';

@NgModule({
  imports: [
    ApplicationDevtoolsModule,
    ConfigurationDevtoolsModule,
    ComponentsDevtoolsModule,
    LocalizationDevtoolsModule,
    RulesEngineDevtoolsModule
  ]
})
export class AppModule {
}

```

Then the services activation can be done in the AppComponent as following:

```typescript
import { ApplicationDevtoolsMessageService } from '@o3r/application';
import { ComponentsDevtoolsMessageService } from '@o3r/components';
import { ConfigurationDevtoolsMessageService } from '@o3r/configuration';
import { LocalizationDevtoolsMessageService } from '@o3r/localization';
import { RulesEngineDevtoolsMessageService } from '@o3r/rules-engine';

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
    if (environment.DEBUG_MODE) {
      // It is strongly recommended to activate the Otter Devtools services only in the development mode
      applicationDevtoolsMessageService.activate();
      componentsDevtoolsMessageService.activate();
      configurationMessageService.activate();
      localizationMessageService.activate();
      rulesEngineDevtoolsMessageService.activate();
    }
  }
}
```

> [!TIP]
> The services can be also activated at bootstrap time by providing `isActivatedOnBootstrap: true` to their dedicated token `OTTER_<module>_DEVTOOLS_OPTIONS` (example: `{provide: 'OTTER_CONFIGURATION_DEVTOOLS_OPTIONS', useValue: {isActivatedOnBootstrap: true}}`). The services need to be injected in the application.
> `platformBrowserDynamic().bootstrapModule(AppModule).then((m) => runInInjectionContext(m.injector, () => inject(ConfigurationDevtoolsConsoleService)))`

### How to enable more features by providing metadata files

In your `angular.json` or `project.json`, you can specify `assets` in the options of `@angular-devkit/build-angular:application`.
```json
{
  "glob": "**/*.metadata.json",
  "input": "path/to/your/app",
  "output": "/metadata"
}
```
> [!CAUTION]
> We recommend to add this asset entry only for the development configuration.

> [!NOTE]
> For the showcase application, we are exposing the metadata in production mode, to be able to showcase the chrome extension features easily.

## How to install the extension

You can find the **Otter Devtools** on the Chrome Store by clicking on [this link](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) or searching for `Otter Devtools` on the [Chrome Web Store](https://chrome.google.com/webstore).
