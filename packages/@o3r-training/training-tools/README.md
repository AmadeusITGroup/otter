<h1 align="center">Otter training tools</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is a module to be used for Otter training purposes.
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/schematics?style=for-the-badge)](https://www.npmjs.com/package/@o3r/schematics)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/schematics?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/schematics)

This module provides basic utilities to use the Otter training such as:
- A code source extractor to generate JSON files compatible with [WebContainer](https://webcontainers.io/guides/working-with-the-file-system).

## How to install

```shell
ng add @o3r-training/training-tools
```

## How to use
You can use the extractor via the CLI to extract a folder from your file system:
```shell
o3r-extract-folder-structure --files \".\path-to-source-folder\" -o webcontainer-folder-structure.js
```
You can also use the `getFilesTree` function with the `WebContainer` file system to serialize its tree:
```typescript
const serializedFiles = await getFilesTree([{
    path,
    isDir: true
  }], instance.fs as FileSystem, EXCLUDED_FILES_OR_DIRECTORY);
```

## Options

| Option                                  | Alias | Value Type | Default Value | Description                                                  |
|-----------------------------------------|:-----:|------------|---------------|--------------------------------------------------------------|
| `--files <files>` <br> **(Required)**   |       | `string`   |               | List of files and folder to extract in addition to the path  |
| `--outout <output>` <br> **(Required)** | `-o`  | `string`   |               | Output file path                                             |
| `--root <root>`                         | `-r`  | `string`   |               | Root of the extraction                                       |

## Description

This is a technical package to be used as dependency by [Otter modules](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md) providing tools to used in the development of Otter training.
