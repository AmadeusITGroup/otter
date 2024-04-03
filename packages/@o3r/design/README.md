<h1 align="center">Otter Design</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/design?style=for-the-badge)](https://www.npmjs.com/package/@o3r/design)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/design?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/design)

Set of tools to generate CSS themes and [Metadata](https://github.com/AmadeusITGroup/otter/tree/main/docs/cms-adapters/CMS_ADAPTERS.md) based on the [Design Token Specifications](https://design-tokens.github.io/community-group/format/).

## How to install

```shell
ng add @o3r/design
```

## Generators

Otter Design module provides a set of code generators based on [Angular schematics](https://angular.io/guide/schematics).

| Schematics   | Description                                             | How to use           |
| ------------ | ------------------------------------------------------- | -------------------- |
| add          | Include Otter design module in a library / application. | `ng add @o3r/design` |
| generate-css | Generate CSS Theme based on Design Token Files          | `ng g generate-css`  |

## Builders

Otter Design module provides a set of builders based on [Angular builders](https://angular.io/guide/cli-builder).

### generate-css

The `generate-css` builder can generate CSS and CMS Metadata based on given Design Token Json files.
The following configurations are available:

| Options                     | Default Value  | Description                                                                                                                          |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **designTokenFilePatterns** | [] *Require*   | Path patterns to the Design Token JSON files. <br /> Files in dependencies are supported and resolved with Node Resolver.            |
| **variableType**            | `'css'`        | Type of the variables to generate for a Design Token.                                                                                |
| **output**                  | *null*         | Output file where the CSS will be generated. <br /> The path specified in `o3rTargetFile` will be ignore if this option is specified |
| **defaultStyleFile**        | src/theme.scss | File path to generate the variable if not determined by the specifications                                                           |
| **metadataOutput**          | *null*         | Path to generate the metadata for the CMS. <br /> The metadata will be generated only if the file path is specified.                 |
| **metadataIgnorePrivate**   | false          | Ignore the private variable in the metadata generation.                                                                              |
| **rootPath**                | *null*         | Root path of files where the CSS will be generated.                                                                                  |
| **failOnDuplicate**         | false          | Determine if the process should stop in case of Token duplication.                                                                   |
| **templateFile**            | *null*         | Path to a template file to apply as default configuration to a Design Token extension.                                               |
| **prefix**                  | *null*         | Prefix to append to generated variables.                                                                                             |
| **prefixPrivate**           | *null*         | Prefix to append to generated private variables.                                                                                     |
| **watch**                   | false          | Enable Watch mode.                                                                                                                   |

### generate-jsonschema

The `generate-jsonschema` builder can generate a [JSON Schema](https://json-schema.org/) validating and providing auto-completion to a third party Design Token file implementing a theme for the current Design system.
The following configurations are available:

| Options                     | Default Value | Description                                                                                                                           |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **designTokenFilePatterns** | [] *Require*  | Path patterns to the Design Token JSON files. <br /> Files in dependencies are supported and resolved with Node Resolver.             |
| **output**                  | *null*        | Output file where the CSS will be generated. <br /> The path specified in `o3rTargetFile` will be ignored if this option is specified |
| **failOnDuplicate**         | false         | Determine if the process should stop in case of Token duplication.                                                                    |
| **schemaId**                | *null*        | ID used in the generated JSON Schema.                                                                                                 |
| **schemaDescription**       | *null*        | Description of the generated JSON Schema.                                                                                             |
| **watch**                   | false         | Enable Watch mode.                                                                                                                    |

## Technical documentation

Documentation providing explanations on the use and customization of the `Design Token` parser and renderers is available in the [technical documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/design/TECHNICAL_DOCUMENTATION.md).
