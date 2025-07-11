<h1 align="center">Otter Store Sync</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/store-sync?style=for-the-badge)](https://www.npmjs.com/package/@o3r/store-sync)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/store-sync?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/store-sync)

This module exposes an NgRx store synchronization solution (synchronous and asynchronous) via the class `StorageSync`.

To facilitate the synchronization, the `StorageSync` class is based on a fork of [ngrx-store-localstorage](https://github.com/btroncone/ngrx-store-localstorage), an exposed package used to sync an NgRx store and the local or session storage.
Compared to the original version of the fork, the **@o3r/store-sync** module includes changes that improve overall synchronization performance.

The features to highlight are:
* The addition of `smartSync`: by default, **@o3r/store-sync** synchronizes a state only if its value changed and no longer matches that of the storage. This feature improves performance, but it can be disabled if wanted.
* The possibility of **asynchronous synchronization**: in our asynchronous storage interface, we have overridden the return type of the `getItem` function to handle promises (the return type is `Promise<string | null>`).

You can read about the changes in the module's [documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/store-sync/STORE_SYNC.md).

## How to install

```shell
ng add @o3r/store-sync
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## More details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/store-sync/STORE_SYNC.md).
