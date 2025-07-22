# Ama SDK Fetch Client

[![Stable Version](https://img.shields.io/npm/v/@ama-sdk/client-fetch?style=for-the-badge)](https://www.npmjs.com/package/@ama-sdk/client-fetch)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-sdk/client-fetch?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-sdk/client-fetch)

This package exposes the **Api Fetch Client** from an SDK based on [@ama-sdk/core](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core).

This package contains all the [Fetch Plugins](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins), helpers and object definitions to dialog with an API following the `ama-sdk` architecture.

> [!TIP]
> Please refer to the [SDK initializer](https://www.npmjs.com/package/@ama-sdk/create) package for getting started with an API client SDK based on `ama-sdk` architecture.

## Setup

The **Api Fetch Client** can be added to your project via the following command:

```shell
ng add @ama-sdk/client-fetch
```

> [!NOTE]
> In case of migration from deprecated `ApiFetchClient` imported from `@ama-sdk/core`, the `ng add` command will replace, in your existing code, the import from `@ama-sdk/core` to `@ama-sdk/client-fetch` for the deprecated dependencies.

## Available plugins

- [abort](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/abort)
- [concurrent](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/concurrent)
- [keepalive](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/keepalive)
- [mock-intercept](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/mock-intercept)
- [perf-metric](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/perf-metric)
- [retry](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/retry)
- [timeout](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/timeout)
- [wait-for](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-fetch/src/plugins/wait-for)
