# @ama-openapi/cli

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental): This package is available in early access, it will be part of the v14 release.

[![Stable Version](https://img.shields.io/npm/v/@ama-openapi/cli?style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/cli)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-openapi/cli?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/cli)

A command-line interface (CLI) tool for managing OpenAPI specifications and their dependencies through manifest files.

## Description

The `@ama-openapi/cli` package provides a CLI tool to automate the installation and management of [OpenAPI specifications](https://redocly.com/) based on [manifest files](https://www.npmjs.com/package/@ama-openapi/core).\
It's part of the [AMA OpenAPI ecosystem](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi) that helps manage OpenAPI dependencies in your projects.

## Installation

### Global Installation

```bash
npm install @ama-openapi/cli
```

> [!INFO]
> The package needs to be installed as a `dependency` to allow [model sharing](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/SHAREABLE_SPECIFICATION.md).

## Usage

The CLI is available through the `ama-openapi` command and provides the following functionality:

```bash
ama-openapi <command> [options]
```

The following global options can be used with any command:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `--log-level`, `-l` | `"silent" \| "error" \| "warning" \| "info" \| "debug"` | `error` | Define the specific level of logs to display in the console |
| `--help`, `-h` |  |  | Show help information |

## Available Commands

### Command `install`

This command scans for [manifest files](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/MANIFEST_CONFIGURATION.md) in the current working directory and installs all [OpenAPI specifications](https://www.openapis.org/) specified in those files. The installation process will download and process the OpenAPI specifications according to the configuration in your manifest.

```bash
ama-openapi install [options]
```

**Examples:**

```bash
# Install dependencies from manifest files
ama-openapi install

# Install with debug output
ama-openapi install --debug

# Install silently
ama-openapi install --silent
```

### Command `watch`

This command starts a file watcher that monitors manifest files for changes. When a manifest file is modified, it automatically triggers the installation process, ensuring your [OpenAPI specifications](https://www.openapis.org/) are always up to date during development.

```bash
ama-openapi watch [options]
```

**Examples:**

```bash
# Start watching manifest files
ama-openapi watch

# Watch with debug output
ama-openapi watch --debug
```

## Expose shareable models

To expose models from the OpenAPI package, the following setups are required:

- The `models/` (or any shareable folder) should be listed in [package.json exports](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#exports) field.
- The `models_external/` should be should be listed in [package.json exposed](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#exports) folders.
- **The `models_external/` folder, with its content, must be present in the installed package**

To ensure the correct resolution of the dependencies with the versions required by the final specification, the presence of the `models_external/` can be achieved only through a [postinstall process](https://www.npmjs.com/package/postinstall).

```json5
// package.json file
{
  "name": "@my/spec",
  "scripts": {
    "postinstall": "ama-openapi install"
  }
}

```

> [!NOTE]
> Find more information regarding the model dependency resolution on [@ama-openapi/core documentation](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/core).

> [!TIP]
> The repository generator from [@ama-openapi/create](https://www.npmjs.com/package/@ama-openapi/create) configures the package to allow the models exposition by default.

## Integration

This CLI tool is designed to work seamlessly with:

- [@ama-openapi/core](https://www.npmjs.com/package/@ama-openapi/core): Core dependency management functionality
- [@ama-openapi/redocly-plugin](https://www.npmjs.com/package/@ama-openapi/redocly-plugin) - Redocly CLI integration
- [@ama-openapi/create](https://www.npmjs.com/package/@ama-openapi/create) - Project scaffolding tool
