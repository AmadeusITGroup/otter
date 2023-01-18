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
This can be done in the AppComponent as following:

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

> **Note**: The **OtterDevtoolsChromeService** is part of the **OtterStoreDevtoolsModule**, it should be imported by the main module.

## How to install the application

Currently the extension is available only in the **Chrome browser** and should be installed as **unpacked extension**.
To do so you will need to follow the steps below:

- Download the extension from the [Azure Feed](https://dev.azure.com/AmadeusDigitalAirline/Otter/_artifacts/feed/otter-pr/Npm/@otter%2Fchrome-devtools/versions/) and *unzip* the archive.
- Go to your [Chrome extension](chrome://extensions/) and switch to **Developer mode** (on the top right corner of the page).
- Click on the **Load unpacked extension** button to install the previously unzip package.
