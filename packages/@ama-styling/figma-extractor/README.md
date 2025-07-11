<h1 align="center">Otter APIs-manager</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@ama-styling/figma-extractor?style=for-the-badge)](https://www.npmjs.com/package/@ama-styling/figma-extractor)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-styling/figma-extractor?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-styling/figma-extractor)

This module will extract the [Design Token](https://tr.designtokens.org/format/) metadata from a given Figma file.

## How to execute

```shell
npx @ama-styling/figma-extractor extract <fileKey>
```

The following options are available:

| Option | Env Variables | Descriptions |
| -- | -- | -- |
| **--help** |  | Show help |
| **--version** |  | Show version number |
| **-a**, **--accessToken** *[string]* | FIGMA_TOKEN | Access Token to read the Figma File information |
| **-o**, **--output** *[string]* | FIGMA_OUTPUT | Folder to extract the Design Token to |
| **--verbose** |  | Determine if the logger display debug messages (default: *false*) |
| **-q**, **--quiet** |  | Determine if it should ignore message in the console (default: *false*) |
| **fileKey** *[string]* | FIGMA_FILE_KEY | File Key of the Figma file to extract |
