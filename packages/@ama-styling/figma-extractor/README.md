<h1 align="center">Otter Figma Extractor</h1>
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

The package exposes to commands: `extract-file` and `extract-project`.\
The 2 commands extract the [Design Tokens](https://tr.designtokens.org/format/) from a single file but the `extract-project` will determine the file to extract based on the filename pattern and the versions extract from it.

### Common Options

| Option | Env Variables | Descriptions |
| -- | -- | -- |
| **--help** |  | Show help |
| **-a**, **--accessToken** *[string]* | FIGMA_TOKEN | Access Token to read the Figma File information |
| **-o**, **--output** *[string]* | FIGMA_OUTPUT | Folder to extract the Design Token to |
| **-n**, **--name** *[string]* | FIGMA_DT_NAME | Name of the Design Token collection (default: *"Design Tokens"*) |
| **--verbose** |  | Determine if the logger display debug messages (default: *false*) |
| **-q**, **--quiet** |  | Determine if it should ignore message in the console (default: *false*) |
| **-g**, **--generatePackage** |  | Request the generation of the NPM package.json (default: *false*) |
| **--packageName** *[string]* |  | Version of the Design Token collection (if not provided, the `name` option value will be used) |

### Extract single Figma File

Extract the [Design Tokens](https://tr.designtokens.org/format/) from a single Figma file.

```shell
npx @ama-styling/figma-extractor extract-file <fileKey> [options]
```

### Extract Figma Project

Extract the [Design Tokens](https://tr.designtokens.org/format/) from a Figma file part of a project.

```shell
npx @ama-styling/figma-extractor extract-project <projectKey> [options]
```

The following options are dedicated to the `extract-project` command:

| Option | Env Variables | Descriptions |
| -- | -- | -- |
| **-P**, **--filenamePattern** *[string]* | FIGMA_PROJECT_FILENAME_MATCHER | Pattern of the filename, capturing its version, to match in the project (default: *"v((?:[0-9]+\\.){0,2}[0-9]+(?:-[^ ]+)?)$"*) |
| **--versionRange** |  | Restricted range of versions of the File to be considered |
| **projectKey** *[string]* | FIGMA_PROJECT_KEY | Figma Project Key where is the file to extract |

## Setup automation

A complete documentation is available on [Figma Extractor documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/figma-extractor/figma-extractor-setup.md)
