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

This module links the SDK generated from your APIs using the [Otter generator](https://www.npmjs.com/package/@ama-sdk/schematics) to your application.
In simpler terms, it offers services to facilitate communication with your APIs.
Its responsibility is to provide an API configuration to a service factory. This enables the factory to create an API instance with the right configurations.

It contains a default configuration and a map of specific configurations for an API or a set of APIs.
Configurations are only exposed through the `getConfiguration` method, which will merge the default configuration and the requested
one.

## How to install

```shell
ng add @o3r/apis-manager
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Usage

The API Manager Module (`ApiManagerModule`) needs to be imported and configured at **application level**, which will then be used by the **ApiFactory** service.

### Application side configuration

The **ApiManager** requires the default API Client, which will be used across all APIs. It supports a second parameter that allows to define specific API Client configurations to set or override per API.

In the example that follows, we define the default base configuration that API classes will use, as well as a custom configuration for the 'ExampleApi'.
The plugins and fetch client come from the ``@ama-sdk/core`` module, but custom ones can be created if needed as long as they follow the ``ApiClient`` interface from ``@ama-sdk/core``. More details on ``@ama-sdk/core`` [here](https://www.npmjs.com/package/@ama-sdk/core).

```typescript
import { ApiFetchClient, ApiKeyRequest, JsonTokenReply, JsonTokenRequest, ReviverReply, ExceptionReply } from '@ama-sdk/core';
import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { ApiManager, ApiManagerModule } from '@o3r/apis-manager';

const PROXY_SERVER = "https://your-enpoint-base-path";
export const apiManager = new ApiManager(
  new ApiFetchClient({
    basePath: PROXY_SERVER,
    requestPlugins: [new ApiKeyRequest('YourApiKey', 'Authorization')]
  }),

  {
    ExampleApi: // <-- custom config for ExampleApi, using jsonToken plugins. If fields are not provided, the default ones (previously defined for all APIs via the ApiFetchClient, as first argument of ApiManager constructor) will be used.
      new ApiFetchClient({
      requestPlugins: [new JsonTokenRequest()],
      replyPlugins: [new ReviverReply(), new ExceptionReply(), new JsonTokenReply()]
    })
  }
);

@NgModule({
  imports: [
    ...,
    ApiManagerModule.forRoot(apiManager)
  ]
})
```

The **ApiManager** instance can be customized via a *factory* function provided to the `API_TOKEN`:

```typescript
import { ApiClient, ApiFetchClient, ApiKeyRequest, Mark, PerformanceMetricPlugin } from '@ama-sdk/core';
import { ApiFetchClient } from '@ama-sdk/client-fetch';
import { ApiManager, ApiManagerModule, API_TOKEN } from '@o3r/apis-manager';
import { EventTrackService } from '@o3r/analytics';

const PROXY_SERVER = "https://your-enpoint-base-path";

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

The API instances can be retrieved via the injection of the ``ApiFactoryService`` provided by the ``ApiManagerModule`` (imported at app level).

```typescript
import { ExampleApi } from '@shared/sdk';
import { ApiFactoryService } from '@o3r/apis-manager';

@Injectable()
class MyClass {

  private exampleApi = inject(ApiFactoryService).getApi(ExampleApi); // <- retrieve example API instantiated with set configuration

  doSomething() {
    const call = this.exampleApi.doSomething({ ... });
  }

}
```

### Enforce custom API usage

Some users may want to enforce existing components or services to use a specific SDK instead of the default API SDK.
To do so, the ``INITIAL_APIS_TOKEN`` will allow to indicate to the ``ApiFactory`` which class it must use (instead of default ones).

In the AppModule:

```typescript
import { ExampleApi, AnotherExampleApi } from '@custom/sdk';
import { INITIAL_APIS_TOKEN } from '@o3r/apis-manager';

@NgModule({
  providers: [
    { provide: INITIAL_APIS_TOKEN, useValue: [ExampleApi, AnotherExampleApi] }
  ]
})
class AppModule {};
```

Then the following code (from an existing component) will use the custom API:

```typescript
import { ExampleApi } from '@shared/sdk';
import { ApiFactoryService } from '@o3r/apis-manager';

@Injectable()
class MyClass {

  private exampleApi = inject(ApiFactoryService).getApi(ExampleApi); // <- retrieve example API instantiated in @custom/sdk

  doSomething() {
    const call = this.exampleApi.doSomething({ ... });
  }

}
```

> [!NOTE]
> Even though the components that you reuse from a library are importing @shared/sdk, the ApiFactoryService will provide at runtime the one that you provided in your app module.

### Override configuration after instantiation

The configuration can be overridden after the instantiation of the API.

```typescript
import { ExampleApi } from '@shared/sdk';
import { ApiFactoryService } from '@o3r/apis-manager';
import { ApiFetchClient } from '@ama-sdk/client-fetch';

@Injectable()
class MyClass {

  constructor(private apiManager: ApiManager, private apiFactoryService: ApiFactoryService) {
  }

  doSomething() {
    this.apiManager.setConfiguration(new ApiFetchClient(), ExampleApi.apiName); // <- override configuration of Example API
    const exampleApi = this.apiFactoryService.getApi(ExampleApi, true); // <- retrieve example API with the new configuration (and refresh the cache)
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
