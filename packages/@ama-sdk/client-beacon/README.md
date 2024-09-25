# Ama SDK Beacon Client

[![Stable Version](https://img.shields.io/npm/v/@ama-sdk/client-beacon?style=for-the-badge)](https://www.npmjs.com/package/@ama-sdk/client-beacon)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-sdk/client-beacon?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-sdk/client-beacon)

This package exposes the **Api Beacon Client** from an SDK based on [@ama-sdk/core](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core).

This package contains all the [Beacon Plugins](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/client-beacon/src/plugins), helpers and object definitions to dialog with an API following the `ama-sdk` architecture.

> [!TIP]
> Please refer to the [SDK initializer](https://www.npmjs.com/package/@ama-sdk/create) package for getting started with an API client SDK based on `ama-sdk` architecture.

## Setup

The **Api Beacon Client** can be added to your project via the following command:

```shell
ng add @ama-sdk/client-beacon
```

> [!NOTE]
> In case of migration from deprecated `ApiBeaconClient` imported from `@ama-sdk/core`, the `ng add` command will replace, in your existing code, the import from `@ama-sdk/core` to `@ama-sdk/client-beacon` for the deprecated dependencies.
