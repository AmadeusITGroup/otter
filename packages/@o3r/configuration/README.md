<h1 align="center">Otter configuration</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/configuration?style=for-the-badge)](https://www.npmjs.com/package/@o3r/configuration)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/configuration?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/configuration)

This module contains configuration-related features (compatibility with the generic configuration UI -- also known as CMS -- being used, configuration override, store, and debugging).
It comes with an integrated ng builder to help you generate configurations supporting the Otter CMS integration.

The aim of implementing `Configuration` inside components is to extract metadata from the application that will be used to override the application's configuration (such as the interface of a CMS).

## How to install

```shell
ng add @o3r/configuration
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Generators

The Otter framework provides a set of code generators based on [Angular schematics](https://angular.io/guide/schematics).

| Schematics                 | Description                                                       | How to use                        |
| -------------------------- |-------------------------------------------------------------------| --------------------------------- |
| add                        | Include the Otter configuration module in a library / application | `ng add @o3r/configuration`       |
| configuration-to-component | Add configuration to an Otter component                           | `ng g configuration-to-component` |


## More details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/configuration/OVERVIEW.md).
