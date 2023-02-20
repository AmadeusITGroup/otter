# Debug

For debugging, there is a dev tool service that you can activate in your application.
It allows you to display a lot of different information about runs.

## Enable Chrome extension debugging

The Otter framework provide a [Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) to help to debug the application.
To enable the communication with the [Otter Devtools](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) the two following steps are required:

1. Importing the Devtools module into the application AppModule:

```typescript
import { RulesEngineDevtoolsModule } from '@o3r/rules-engine';

@NgModule({
  imports: [
    ...,
    RulesEngineDevtoolsModule
  ]
})
export class AppModule { }
```

2. The debug message service needs to be activated

```typescript
import { RulesEngineDevtoolsMessageService } from '@o3r/rules-engine';

@Component({ ... })
export class AppComponent {
  constructor(rulesEngineDevtoolsMessageService: RulesEngineDevtoolsMessageService) {
    if (IS_DEBUG_MODE) {
      rulesEngineDevtoolsMessageService.activate();
    }
  }
}
```

> **Note**: get more details on [dev tools session](../../dev-tools/chrome-devtools.md);
