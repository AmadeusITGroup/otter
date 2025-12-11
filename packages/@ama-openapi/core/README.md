# @ama-openapi/core Documentation

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental): This package is available in early access, it will be part of the v14 release.

[![Stable Version](https://img.shields.io/npm/v/@ama-openapi/core?style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/core)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-openapi/core?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/core)

This package provides a **dependency management system for OpenAPI specifications** in JavaScript/TypeScript projects, enabling modular and reusable OpenAPI definitions.

## Core Concept

The system leverages **NPM's package resolution mechanism** to manage OpenAPI specification dependencies, allowing you to:

- Install OpenAPI specs as NPM packages
- Reference external models in your specifications
- Apply transformations to imported models
- Handle complex versioning and conflict resolution

> [!NOTE]
> Get complete information regarding the concept in the [Dependency Resolution Concept documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/DEPENDENCY_RESOLUTION_CONCEPT.md).

## Key Workflow

1. **Install Dependencies**: Add OpenAPI packages via `npm install @my/dep-spec` or create a new project thanks to the [project initializer](https://npmjs.com/package/@ama-openapi/create).
2. **Configure Manifest**: Define which models to extract in `openapi.manifest.json` (or other) that can be defined following [manifest documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/MANIFEST_CONFIGURATION.md)
3. **Extract Models**: Run the command `ama-openapi install` from [@ama-openapi/cli](https://npmjs.com/package/@ama-openapi/cli) to extract models into `models_external/` directory
4. **Reference Models**: Use [extracted models](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/EXTRACTED_MODEL_DETAILS.md) in your specification files
5. **Bundle**: Use `redocly bundle` to create the final specification

## Transformation Features

Models can be transformed during extraction:

- **rename**: Rename model files (e.g., `"myPrefix_$1"`)
- **titleRename**: Rename model titles
- **mask**: Filter/override/add properties using Stoplight mask syntax

> [!NOTE]
> Get complete documentation regarding the transformation features in [Transform documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/TRANSFORM.md)

## Model Extraction Types

According to if a mask is applied or not on the referred models, the extraction process will:

- generates a simple redirect file with `$ref` pointing to `node_modules`
- generates modified model with applied transformations and annotations (`x-internal-*` fields)

A description of the extracted models is available on [extracted models documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/DEPENDENCY_RESOLUTION_CONCEPT.md).

## Shareable Specifications

To create a shareable specification:

1. Create valid `package.json` with `name`, `version`, and `exports` field
2. List external dependencies in `dependencies`
3. Extract external models during `postinstall` lifecycle
4. Publish to NPM registry

> [!NOTE]
> Complete documentation is available on [dedicated shaerable specification section](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/SHAREABLE_SPECIFICATION.md).

## Integration

This package works in the **Ama OpenApi ecosystem** including:

- [@ama-openapi/cli](https://npmjs.com/package/@ama-openapi/cli) - Manual dependency installation
- [@ama-openapi/redocly-plugin](https://npmjs.com/package/@ama-openapi/redocly-plugin) - Redocly CLI integration
- [@ama-openapi/create](https://npmjs.com/package/@ama-openapi/create) - Project scaffolding

The package **@ama-openapi/core** exposed divers items to facilitate a manual setup in the [technical documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/openapi/TECHNICAL_INFORMATION.md).
