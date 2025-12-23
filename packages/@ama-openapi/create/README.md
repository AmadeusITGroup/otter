# Ama OpenAPI Create

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental): This package is available in early access, it will be part of the v14 release.

[![Stable Version](https://img.shields.io/npm/v/@ama-openapi/create?style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/create)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-openapi/create?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/create)

**@ama-openapi/create** is a template generator package that provides scaffolding and templates for creating OpenAPI-based projects.
It helps developers quickly set up new OpenAPI projects with best practices and a standardized structure.

## Usage

```shell
npm create @ama-openapi -- [options]
```

The following global options can be used with any command:

| Options | Description |
| --- | --- |
| `--version`, `-v` | Display the current version of the generator. |
| `--help`, `-h` | Display usage for the CLI commands. |

## Generate Open Api basic project

Create a new [OpenAPI](https://www.openapis.org/) basic project via the following command :

```shell
npm create @ama-openapi <project-name> -- [options]
```

The following options are available:

| Options | Default Value | Description |
| --- | --- | --- |
| `--target`, `-t` | `.` | Target directory where files will be generated. |

The command will generate a directory with the following structure:

```text
my-openapi-project/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── apis/
│   └── example.v1.yaml
├── models/
│   └── exampleModel.v1.yaml
├── responses/
│   └── exampleResponse.v1.yaml
├── .gitignore
├── openapi.manifest.yaml
├── package.json
├── redocly.yaml
├── README.md
└── renovate.json
```

> [!NOTE]
> The package includes several template files that are customized during project generation:
>
> - **API specifications**: Example OpenAPI YAML files
> - **Configuration files**: Project-specific configurations
> - **Development environment**: VS Code settings and extensions
> - **Package management**: Pre-configured `package.json` file with common scripts
> - **Renovate Configuration**: Extends the [@ama-openapi/core preset] package (<https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-openapi/core/renovate/default.json>)

## Integration

This generator sets up the repository to work with:

- [@ama-openapi/core](https://www.npmjs.com/package/@ama-openapi/core): Core dependency management functionality
- [@ama-openapi/redocly-plugin](https://www.npmjs.com/package/@ama-openapi/redocly-plugin): Redocly CLI integration
- [@ama-openapi/cli](https://www.npmjs.com/package/@ama-openapi/cli): Command to manually retrieve the dependencies
