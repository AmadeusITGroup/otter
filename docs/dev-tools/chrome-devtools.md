# Otter Chrome DevTools

Otter Framework is providing an [Otter Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) for your applications.
The extension comes with the following features:

- **Application information**: application version, environment, build date, etc.
- **Localization keys display**
- **Visual Testing toggle**
- **Rule Engine current state**: rule engine state, rule engine logs, etc.
- **Configuration**: display and modification of the application components configuration.
- **Theming**: display and modification of the application theming variables.
- **States**: save customization to be able to apply it later or share it.

## How to install the extension

You can find the **Otter Devtools** Chrome extension by clicking on [this link](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) or by searching for `Otter DevTools` in the [Chrome Web Store](https://chrome.google.com/webstore).

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
> This configuration is set by the `--with-devtool` option of the `ng add @o3r/core` command.

## How to manually enable the extension support in your application

Once you have download the extension, you will need to enable the features you need one by one. There is no root toggle.
To do so, you will need to import the corresponding modules in you `AppModule`:

```typescript
import { ApplicationDevtoolsModule } from '@o3r/application';
import { ComponentsDevtoolsModule } from '@o3r/components';
import { ConfigurationDevtoolsModule } from '@o3r/configuration';
import { LocalizationDevtoolsModule } from '@o3r/localization';
import { RulesEngineDevtoolsModule } from '@o3r/rules-engine';
import { StylingDevtoolsModule } from '@o3r/styling';

@NgModule({
  imports: [
    ApplicationDevtoolsModule,
    ConfigurationDevtoolsModule,
    ComponentsDevtoolsModule,
    LocalizationDevtoolsModule,
    RulesEngineDevtoolsModule,
    StylingDevtoolsModule
  ]
})
export class AppModule {}
```

Then the activation of the services can be done in the `AppComponent` as follows:

```typescript
import { ApplicationDevtoolsMessageService } from '@o3r/application';
import { ComponentsDevtoolsMessageService } from '@o3r/components';
import { ConfigurationDevtoolsMessageService } from '@o3r/configuration';
import { LocalizationDevtoolsMessageService } from '@o3r/localization';
import { RulesEngineDevtoolsMessageService } from '@o3r/rules-engine';
import { StylingDevtoolsMessageService } from '@o3r/styling';

@Component({
  selector: 'app'
})
export class AppComponent {
  constructor(
    applicationDevtoolsMessageService: ApplicationDevtoolsMessageService,
    componentsDevtoolsMessageService: ComponentsDevtoolsMessageService,
    configurationMessageService: ConfigurationDevtoolsMessageService,
    localizationMessageService: LocalizationDevtoolsMessageService,
    rulesEngineDevtoolsMessageService: RulesEngineDevtoolsMessageService,
    stylingDevtoolsMessageService: StylingDevtoolsMessageService
  ) {
    if (environment.DEBUG_MODE) {
      // It is strongly recommended to activate the Otter Devtools services only in the development mode
      applicationDevtoolsMessageService.activate();
      componentsDevtoolsMessageService.activate();
      configurationMessageService.activate();
      localizationMessageService.activate();
      rulesEngineDevtoolsMessageService.activate();
      stylingDevtoolsMessageService.activate();
    }
  }
}
```

> [!TIP]
> The services can be also activated at bootstrap time by providing `isActivatedOnBootstrap: true` to their dedicated token `OTTER_<module>_DEVTOOLS_OPTIONS`. For example:
> 
> `{provide: 'OTTER_CONFIGURATION_DEVTOOLS_OPTIONS', useValue: {isActivatedOnBootstrap: true}}`
> 
> The services need to be injected in the application.
> 
> `platformBrowserDynamic().bootstrapModule(AppModule).then((m) => runInInjectionContext(m.injector, () => inject(ConfigurationDevtoolsConsoleService)))`

### How to enable more features by providing metadata files

In your `angular.json` or `project.json`, you can specify `assets` in the options of `@angular-devkit/build-angular:application`.
```json5
"executor": "@angular-devkit/build-angular:application",
"options": {
  // ...,
  "assets": [
    // ...,
    {
      "glob": "**/*.metadata.json",
      "input": "apps/showcase",
      "output": "/metadata"
    }
  ]
},
// ...
```

> [!CAUTION]
> We recommend adding this asset entry for the development configuration only.

> [!NOTE]
> For the showcase application, we are exposing the metadata in production mode, in order to easily showcase the Chrome extension features.

## How to test local modifications of the extension

If you are locally implementing modifications in the Otter DevTools extension, you can test these changes with the following steps:
* Build the chrome-devtools application: `yarn nx build chrome-devtools`
* Change the version from `0.0.0-placeholder` to `0.0.0` in the files `dist/package.json` and `dist/manifest.json`
* Go to the link `chrome://extensions/` (enable `Developer mode` in the top-right corner), click the `Load unpacked` button, and select the `dist` folder of the previously built chrome-devtools application
