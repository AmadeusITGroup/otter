# App Server routing

In order to get angular routing redirection to work correctly, you have to correctly provide the ``APP_BASE_HREF`` token from ``@angular/common``. To ease this process, we have created a new routing module to handle this provider together with some useful shell commands.

In your app, you just need to import the ``AppServerRoutingModule`` from ``@o3r/routing``. Example:

```typescript
// ...
import {AppServerRoutingModule} from '@o3r/routing';
// ...

@NgModule({
  imports: [
    // ...
    AppServerRoutingModule,
    // ...
  ],
  // ...
})
export class AppModule {}
```

By default, the ``APP_BASE_HREF`` will be provided using one of the following items (by priority):
  * Disabled if it's not the PROD environment
  * the content of ``data-appbasehref`` attribute of ``body``
  * the value of ``--app-base-href`` cli option is passed in the build. If the value is not passed, ``APP_BASE_HREF`` will be disabled
