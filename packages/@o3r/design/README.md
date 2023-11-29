<h1 align="center">Otter Design</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

Set of tools to generate CSS themes and [Metadata](https://github.com/AmadeusITGroup/otter/tree/main/docs/cms-adapters/CMS_ADAPTERS) based on [Design Token Specification](https://design-tokens.github.io/community-group/format/).

## How to install

```shell
ng add @o3r/design
```

## Generators

Otter Design module provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics                 | Description                                                    | How to use                        |
| -------------------------- | -------------------------------------------------------------- | --------------------------------- |
| add                        | Include Otter design module in a library / application.        | `ng add @o3r/design`              |
| generate-css               | Generate CSS Theme based on Design Token Files                 | `ng g generate-css`               |

## Builders

Otter Design module provides a set of builders based on [angular builders](https://angular.io/guide/cli-builder).

| Builders                   | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| generate-css               | Generate CSS Theme and Metadata based on Design Token Files    |
