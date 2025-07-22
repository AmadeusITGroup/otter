<h1 align="center">Otter localization</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/localization?style=for-the-badge)](https://www.npmjs.com/package/@o3r/localization)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/localization?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/localization)

The localization module is built on top of an open source [ngx-translate](https://github.com/ngx-translate/core) library.
It provides the following features:

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
ng add @o3r/localization
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Generators

Otter framework provides a set of code generators based on [Angular schematics](https://angular.io/guide/schematics).

| Schematics                    | Description                                                 | How to use                           |
|-------------------------------|-------------------------------------------------------------|--------------------------------------|
| add                           | Include Otter localization module in a library/application. | `ng add @o3r/localization`           |
| localization-to-component     | Add localization architecture to an Otter component         | `ng g localization-to-component`     |
| localization-key-to-component | Add a localization key to an Otter component                | `ng g localization-key-to-component` |

## More details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/localization/LOCALIZATION.md).
