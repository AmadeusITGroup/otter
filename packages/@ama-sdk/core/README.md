# @ama-sdk Core

This package contains all the [plugins](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins), helpers and object definitions to dialog with an API following the `ama-sdk` architecture.

Please refer to the [ama-sdk-schematics](../schematics/README.md) package for getting started with an API based on `ama-sdk`.

## Available plugins

- [additional-params](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/additional-params)
- [api-configuration-override](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/api-configuration-override)
- [api-key](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/api-key)
- [bot-protection-fingerprint](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/bot-protection-fingerprint)
- [concurrent](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/concurrent)
- [core](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/core)
- [client-facts](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/client-facts)
- [custom-info](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/custom-info)
- [exception](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/exception)
- [fetch-cache](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/fetch-cache)
- [fetch-credentials](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/fetch-credentials)
- [json-token](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/json-token)
- [keepalive](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/keepalive)
- [mock-intercept](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/mock-intercept)
- [perf-metric](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/perf-metric)
- [pii-tokenizer](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/pii-tokenizer)
- [raw-response-info](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/raw-response-info)
- [retry](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/retry)
- [reviver](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/reviver)
- [session-id](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/session-id)
- [si-token](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/si-token)
- [simple-api-key-authentication](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/simple-api-key-authentication)
- [url-rewrite](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/url-rewrite)
- [wait-for](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/wait-for)
- [timeout](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/plugins/timeout)

## Available API Client

The **API Clients** are mandatory to the SDK to indicate the service that should be used by the SDK to process the calls.
A list of API Clients are provided by this package:

| API Client       | Import                                   | Description                                                                    |
|------------------|------------------------------------------|--------------------------------------------------------------------------------|
| ApiFetchClient   | @ama-sdk/core                            | Default API Client based on the browser FetchApi                               |
| ApiBeaconClient  | @ama-sdk/core                            | API Client based on the browser BeaconApi, it is processing synchronous call   |
| ApiAngularClient | @ama-sdk/core/clients/api-angular-client | API Client using the HttpClient exposed by the `@angular/common` package       |

### Logs

In order to ease the logging in the ama-sdk plugins, it is possible to connect to third-party logging services.
This can be achieved by adding a `Logger` [implementation](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core/src/fwk/logger.ts) to the options of an API client.

For example, in the Otter showcase application, we could add a `ConsoleLogger` (from `@o3r/core`) as a parameter to the ApiFetchClient:

```typescript
const logger = new ConsoleLogger();
function petApiFactory() {
  const apiConfig: ApiClient = new ApiFetchClient(
    {
      basePath: 'https://petstore3.swagger.io/api/v3',
      requestPlugins: [new SessionIdRequest()],
      fetchPlugins: [],
      logger
    }
  );
  return new PetApi(apiConfig);
}
```

> *Note*: Adding a third-party logging service is optional. If undefined, the fallback is the console logger.
