# Ama OpenAPI Create extension

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental): This package is available in early access, it will be part of the v14 release.

[![Stable Version](https://img.shields.io/npm/v/@ama-openapi/create?style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/create)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-openapi/create?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/create)

**@ama-openapi/create-extension** is a template generator package that provides scaffolding and templates for creating OpenAPI-based extension projects.
It helps developers quickly set up new OpenAPI extension projects with best practices and a standardized structure.

## Usage

```shell
npm create @ama-openapi/extension <command> -- [options]
```

The following global options can be used with any command:

| Options | Description |
| --- | --- |
| `--version`, `-v` | Display the current version of the generator. |
| `--help`, `-h` | Display usage for the CLI commands. |

## Available commands

### Design Extension Project

Create a new [OpenAPI](https://www.openapis.org/) design project extension via the following command:

```shell
npm create @ama-openapi extension <project-name> -- [options]
```

The following options are available:

| Options | Default Value | Description |
| --- | --- | --- |
| `--target`, `-t` | `.` | Target directory where files will be generated. |
| `--dependency-base-spec`, `-b` | - | Name of the NPM artifact to use as the dependency base specification (e.g. @my-org/specification). |

The command will generate a directory with the same structure of the `design` command but will setup the repository to prepare the generation of 3 specification:

- `base` specification which is extended by the current specification
- `extension` specification bundling only the specification defined in the current project
- `merge` specification which is the merge of the `base` and `extension` specifications

## Integration

This generator sets up the repository to work with:

- [@ama-openapi/core](https://www.npmjs.com/package/@ama-openapi/core): Core dependency management functionality
- [@ama-openapi/redocly-plugin](https://www.npmjs.com/package/@ama-openapi/redocly-plugin): Redocly CLI integration
- [@ama-openapi/cli](https://www.npmjs.com/package/@ama-openapi/cli): Command to manually retrieve the dependencies
- [@ama-openapi/create](https://www.npmjs.com/package/@ama-openapi/create) - Project scaffolding tool
