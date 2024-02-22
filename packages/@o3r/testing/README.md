<h1 align="center">Otter testing</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

The module provides testing (e2e, unit test) utilities to help you build your own E2E pipeline integrating visual testing.

## How to install

```shell
ng add @o3r/testing
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Description

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/testing/).

## Generators

Otter framework provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics                 | Description                                                                   | How to use                        |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| add                        | Include Otter testing module in a library / application.                      | `ng add @o3r/testing`             |
| fixture-to-component       | Add fixture to an Otter component                                             | `ng g fixture-to-component`       |
| add-functions-to-fixture   | Adding functions to an Otter fixture based on a selector and default methods. | `ng g add-functions-to-fixture`   |
