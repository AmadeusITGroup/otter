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

## Generators

Otter framework provides a set of code generators based on [Angular schematics](https://angular.io/guide/schematics).

| Schematics                          | Description                                             | How to use                                 |
|-------------------------------------|---------------------------------------------------------|--------------------------------------------|
| add                                 | Include Otter transloco module in a library/application | `ng add @o3r/transloco`                    |
| localization-to-component           | Add localization architecture to an Otter component     | `ng g localization-to-component`           |
| localization-key-to-component       | Add a localization key to an Otter component            | `ng g localization-key-to-component`       |
| migration-localization-to-transloco | Migrate from @o3r/localization to @o3r/transloco        | `ng g migration-localization-to-transloco` |

## Migrating from @o3r/localization

If you're upgrading from `@o3r/localization` (ngx-translate), use the migration schematic:

```bash
ng g @o3r/transloco:migration-localization-to-transloco
```

For detailed migration instructions, including manual steps required after running the schematic, see the [Migration Guide](../../../docs/transloco/localization-to-transloco.md).

## More details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/transloco/TRANSLOCO.md).
