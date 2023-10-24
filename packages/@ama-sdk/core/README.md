# @ama-sdk Core

This package contains all the [plugins](/packages/@ama-sdk/core/src/plugins), helpers and object definitions to dialog with an API following the `ama-sdk` architecture.

Please refer to the [ama-sdk-schematics](/packages/@ama-sdk/schematics/README.md) package for getting started with an API based on `ama-sdk`.

## Available plugins

- [additional-params](/packages/@ama-sdk/core/src/plugins/additional-params)
- [api-configuration-override](/packages/@ama-sdk/core/src/plugins/api-configuration-override)
- [api-key](/packages/@ama-sdk/core/src/plugins/api-key)
- [bot-protection-fingerprint](/packages/@ama-sdk/core/src/plugins/bot-protection-fingerprint)
- [concurrent](/packages/@ama-sdk/core/src/plugins/concurrent)
- [core](/packages/@ama-sdk/core/src/plugins/core)
- [client-facts](/packages/@ama-sdk/core/src/plugins/client-facts)
- [custom-info](/packages/@ama-sdk/core/src/plugins/custom-info)
- [exception](/packages/@ama-sdk/core/src/plugins/exception)
- [fetch-cache](/packages/@ama-sdk/core/src/plugins/fetch-cache)
- [fetch-credentials](/packages/@ama-sdk/core/src/plugins/fetch-credentials)
- [json-token](/packages/@ama-sdk/core/src/plugins/json-token)
- [keepalive](/packages/@ama-sdk/core/src/plugins/keepalive)
- [mock-intercept](/packages/@ama-sdk/core/src/plugins/mock-intercept)
- [perf-metric](/packages/@ama-sdk/core/src/plugins/perf-metric)
- [pii-tokenizer](/packages/@ama-sdk/core/src/plugins/pii-tokenizer)
- [raw-response-info](/packages/@ama-sdk/core/src/plugins/raw-response-info)
- [retry](/packages/@ama-sdk/core/src/plugins/retry)
- [reviver](/packages/@ama-sdk/core/src/plugins/reviver)
- [session-id](/packages/@ama-sdk/core/src/plugins/session-id)
- [si-token](/packages/@ama-sdk/core/src/plugins/si-token)
- [simple-api-key-authentication](/packages/@ama-sdk/core/src/plugins/simple-api-key-authentication)
- [url-rewrite](/packages/@ama-sdk/core/src/plugins/url-rewrite)
- [wait-for](/packages/@ama-sdk/core/src/plugins/wait-for)
- [timeout](/packages/@ama-sdk/core/src/plugins/timeout)

## Available API Client

The **API Clients** are mandatory to the SDK to indicate the service that should be used by the SDK to process the calls.
A list of API Clients are provided by this package:

| API Client       | Import                                   | Description                                                                    |
|------------------|------------------------------------------|--------------------------------------------------------------------------------|
| ApiFetchClient   | @ama-sdk/core                            | Default API Client based on the browser FetchApi                               |
| ApiBeaconClient  | @ama-sdk/core                            | API Client based on the browser BeaconApi, it is processing synchronous call   |
| ApiAngularClient | @ama-sdk/core/clients/api-angular-client | API Client using the HttpClient exposed by the `@angular/common` package       |
