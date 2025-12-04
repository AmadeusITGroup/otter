# Ama OpenAPI Redocly Plugin

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental): This package is available in early access, it will be part of the v14 release.

[![Stable Version](https://img.shields.io/npm/v/@ama-openapi/redocly-plugin?style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/redocly-plugin)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-openapi/redocly-plugin?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/redocly-plugin)

A Redocly CLI plugin for managing OpenAPI dependencies and masking operations based on [@ama-openapi/core](https://www.npmjs.com/package/@ama-openapi/core).

## Overview

This plugin extends the Redocly CLI with functionality to handle OpenAPI dependency setup and content masking. It leverages the core dependency management system provided by `@ama-openapi/core` to automatically resolve and integrate OpenAPI dependencies in your specifications.

## Features

- **Dependency management**: Automatically resolves and manages OpenAPI dependencies
- **Content masking**: Applies masking rules to hide or transform sensitive information in OpenAPI specifications
- **Redocly integration**: Seamlessly integrates with the Redocly CLI toolchain
- **Configurable**: Supports custom configuration for dependency resolution and masking rules

## Installation

```bash
npm install @ama-openapi/redocly-plugin
```

## Usage

### Basic Configuration

Add the plugin to your Redocly configuration file (`.redocly.yaml` or `redocly.yaml`):

```yaml
plugins:
  - '@ama-openapi/redocly-plugin'
```

### Dependency Retrieval

The plugin retrieves dependencies defined in your [OpenAPI Configuration](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/core#manifest-configuration):

```json5
// in the package.json file
{
  "name": "@my/specification",
  "dependencies": {
    "@specification/pet-store": "latest"
  }
}
```

```yaml
# in the openapi.manifest.yaml
models:
  "@specification/pet-store": "models/pet.v1.yaml"
```

```yaml
# in your specification
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0

content:
  application/json:
    schema:
      type: object
        properties:
          data:
            $ref: './specification/pet-store/models/pet.v1.yaml'

```

> [!TIP]
> Find the documentation regarding the package management strategy on [Node Package Manager](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/core#dependency-resolution-concept).\
> Find a complete documentation regarding the Manifest on the [OpenAPI Configuration](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/core#manifest-configuration).

### Masking Configuration

A full documentation on masking specified information is available in [OpenAPI Masking configuration](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/core#manifest-configuration).\
A simple example can be:

```yaml
# in the openapi.manifest.yaml
models:
  "@specification/pet-store":
    - path: "models/pet.v1.yaml"
      transform:
        - fileRename: "my-$1"
          mask:
            properties:
              exampleField:
```

## Available plugin configurations

As the plugin must be executed at the initialization of the Redocly process, the configuration of the plugin should be provided via [environment variables](https://en.wikipedia.org/wiki/Environment_variable).

The following environment variables are supported:

| Environment Variable | Description | Default Value |
| --- | --- | --- |
| `AMA_OPENAPI_REDOCLY_CONTINUE_ON_ERROR` | Ignore process failure and continue Redocly process | `false` |
| `AMA_OPENAPI_REDOCLY_VERBOSE` | Display debug level logs | `false` |
| `AMA_OPENAPI_REDOCLY_QUIET` | Suppress all output| `false` |

## Integration

This Redocly Plugin is designed to work with the following tools:

- [@ama-openapi/core](https://www.npmjs.com/package/@ama-openapi/core): Core dependency management functionality
- [@ama-openapi/cli](https://www.npmjs.com/package/@ama-openapi/cli): Command to manually retrieve the dependencies
- [@ama-openapi/create](https://www.npmjs.com/package/@ama-openapi/create): Project scaffolding tool
