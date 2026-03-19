<h1 align="center">Otter Transloco</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental)
> This package is the successor to `@o3r/localization` (which is based on ngx-translate).
> In Otter v16, this package will be renamed to `@o3r/localization`, and ngx-translate will no longer be supported.

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/transloco?style=for-the-badge)](https://www.npmjs.com/package/@o3r/transloco)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/transloco?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/transloco)

This localization module is built on top of [JSVerse Transloco](https://github.com/jsverse/transloco).
It provides the same features as `@o3r/localization` (which is based on ngx-translate):

* Multiple [locales](https://github.com/angular/angular/tree/master/packages/common/locales) support, switchable at runtime.
* RTL (right-to-left) text direction support
* Translations loader using a specific endpoint or defaulting to local translation bundles
* Fallback language and intelligent fallback support
* Translation of resource keys from templates (`*.html`) and from typescript (`*.ts`)
* Support for resource keys with parameters
* Custom `LocalizationConfiguration`
* Ability to toggle translations on and off for debugging (and additional debug tools)

## How to install

```shell
ng add @o3r/transloco
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.
