<h1 align="center">Otter APIs-manager</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/apis-manager?style=for-the-badge)](https://www.npmjs.com/package/@o3r/apis-manager)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/apis-manager?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/apis-manager)

This module provides services to help you communicate with your APIs. Its responsibility is to provide an API configuration to a service factory so that it could instantiate an API with the right configurations.

It contains a default configuration and a map of specific configurations for API / set of API.
Configurations are only exposed through the method `getConfiguration`, which will merge the default configuration and the requested
one.

## How to install

```shell
ng add @o3r/apis-manager
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Usage

The API Manager Module will need to be imported and configured in the **application module** which will then be used by the **ApiFactory**.

### Application side configuration

The **ApiManager** requires the default Api Client which will be used in all the APIs and support a second parameter that allows the user to define specific Api Client per APIs.

```typescript
export const apiManager = new ApiManager(
  new ApiFetchClient({
    basePath: PROXY_SERVER,
    requestPlugins: [new ApiKeyRequest('YourApiKey', 'Authorization')]
  }),

  {
    ExampleApi: // <--custom config for ExampleApi, using jsonToken plugins. If fields are not provided, the default ones will be taken.
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

The **ApiManager** instance can be customized via *factory* provided to `API_TOKEN`:

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

### Enforce custom API usage

Some users may want to enforce existing components or services to use a specific Sdk instead of default API SDK.
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

Then the following code (from an existing component) will use the custom Api:

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

## Helper functions

### Preconnect

The appendPreconnect function adds a preconnect <link> element to the DOM. This can be used to inform the browser that resources from a certain origin will be needed in the future, so that the browser can start resolving DNS, establishing TCP connections, and performing TLS handshakes early, reducing the overall page load time.

To use this function, simply call it with the `baseUrl` parameter set to the origin of the resource you will need in the future. If you want to add the crossorigin attribute to the link element, set the `supportCrossOrigin` parameter to `true`. For example:

```typescript
import { appendPreconnect } from '@o3r/apis-manager';

appendPreconnect('https://your-api.com', true);
```

This will add a preconnect link element to the DOM with the href attribute set to <https://example.com> and the crossorigin attribute set to an empty string.

#### Benefits of using preconnect

Using preconnect can have several benefits:

- Faster page load times: By preconnecting to endpoints that will be needed in the future, the browser can start resolving DNS, establishing TCP connections, and performing TLS handshakes early, reducing the overall page load time.

- Better user experience: Faster page load times can lead to a better user experience, as users will not have to wait as long for the page to load.

- Reduced server load: By preconnecting to endpoints that will be needed in the future, the server load can be reduced, as the server can start serving the resources earlier.

- Improved SEO: Faster page load times can improve the search engine rankings of a website, as search engines take page load times into account when ranking websites.
