# Api manager

Api manager is responsible to provide an api configuration to a service factory, so that it could instantiate an API with
the right configurations. It contains a default configuration and a map of specific configurations for API / set of API.
Configurations are only exposed through the method `getConfiguration`, which will merge the default configuration and the requested
one.

## Usage

The API Manager Module will need to be imported and configured in the **application module** it will then be used by the **ApiFactory**.

### Application side configuration

The **ApiManager** requires the default Api Client which will be used in all the APIs and support a second parameter that allow the user to define specific Api Client per APIs.

```typescript
export const apiManager = new ApiManager(
  new ApiFetchClient({
    basePath: PROXY_SERVER, // <-- default configuration, plugins not mandatory.
    requestPlugins: [new ApiKeyRequest('YourApiKey', 'Authorization')]
  }),

  {
    ExampleApi: // <--custom config for ExampleApi, using jsonToken plugins. If fields are not provided, default ones will be taken.
      new ApiFetchClient({
      requestPlugins: [new JsonTokenRequest()],
      replyPlugins: [new ReviverReply(), new ExceptionReply(), new JsonTokenReply()]
    })
  }
);

@NgModule({
  imports: [
    ...,
    ApiManagerModule.forRoot(apiManager);
  ]
})
```

The **ApiManager** can be provided via *factory* by providing the `API_TOKEN`:

```typescript
export function apiFactory(eventTrackService: EventTrackService): ApiManager {

  const apiConfig: ApiClient = new ApiFetchClient(
    {
      basePath: PROXY_SERVER,
      requestPlugins: [new ApiKeyRequest('YourApiKey', 'Authorization')],
      fetchPlugins: [new PerformanceMetricPlugin({
        onMarkComplete: (m: Mark) => eventTrackService.addSDKServerCallMark(m)
      })]
    }
  );

  return new ApiManager(apiConfig, {
    LoggingApi: new ApiFetchClient({basePath: '/api'})
  });
}

@NgModule({
  imports: [
    ...,
    ApiManagerModule
  ],
  providers: [
    ...,
    {provide: API_TOKEN, useFactory: apiFactory, deps: [EventTrackService]}
  ]
})
```

### Retrieve API instance with configuration

The API instances can be retrieved via the injection of the **ApiFactory** provided by the **ApiManagerModule**.

```typescript
import { ExampleApi } from '@shared/sdk';

@Inject()
class MyClass {

  constructor(private apiFactoryService: ApiFactoryService) {
  }

  doSomething() {
    const exampleApi = apiFactoryService.getApi(ExampleApi); // <- retrieve example API instantiated with set configuration
    const call = exampleApi.doSomething({ ... });
  }

}
```

> [!WARNING]
> Do not forget to import the **ApiManagerModule** in you component module

### Enforce custom Api usage

Some user may want to enforce existing components or services to use a specific Sdk instead of default API SDK.
To do so the **INITIAL_APIS_TOKEN** will allow to indicate to the **ApiFactory** the class they will need to use (instead of default ones).

In the AppModule:

```typescript
import { ExampleApi, AnotherExampleApi } from '@custom/sdk';
import { INITIAL_APIS_TOKEN } from '@o3r/apis-manager';

@NgModule({
  providers: {
    { provide: INITIAL_APIS_TOKEN, useValue: [ExampleApi, AnotherExampleApi] }
  }
})
class AppModule {};
```

Then following code (from an existing component) will use the custom Api:

```typescript
import { ExampleApi } from '@shared/sdk';
import { ApiFactoryService } from '@o3r/apis-manager';

@Injectable()
class MyClass {

  constructor(private apiFactoryService: ApiFactoryService) {
  }

  doSomething() {
    const exampleApi = apiFactoryService.getApi(ExampleApi); // <- retrieve example API instantiated from the @custom/sdk
    const call = exampleApi.doSomething({ ... });
  }

}
```

> [!NOTE]
> Even though the components that you reuse from a library are importing @shared/sdk, the ApiFactoryService will provide at runtime the one that you provided in your app module

### Override configuration after instantiation

The configuration can be overridden after the instantiation of the API.

```typescript
import { ExampleApi } from '@shared/sdk';
import { ApiFactoryService, INTERNAL_API_TOKEN } from '@o3r/apis-manager';

@Injectable()
class MyClass {

  constructor(@Inject(INTERNAL_API_TOKEN) private apiManager: ApiManager, private apiFactoryService: ApiFactoryService) {
  }

  doSomething() {
    this.apiManager.setConfiguration(new ApiFetchClient(), ExampleApi); // <- override configuration for Example API
    const exampleApi = apiFactoryService.getApi(ExampleApi, true); // <- retrieve example API with the new configuration (and update the cache)
  }

}
```
