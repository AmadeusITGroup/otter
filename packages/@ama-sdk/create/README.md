<h1 align="center">SDK project initializer</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

[![Stable Version](https://img.shields.io/npm/v/@ama-sdk/create?style=for-the-badge)](https://www.npmjs.com/package/@ama-sdk/create)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-sdk/create?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-sdk/create)

This package is an [NPM initializer](https://docs.npmjs.com/cli/v8/commands/npm-init) to generate an API client SDK based on [OpenAPI specification](https://spec.openapis.org/oas/v3.1.0).

## Create an SDK package

This package is simplifying the start of new SDK repository.

## Usage

```shell
npm create @ama-sdk typescript <package-name> -- [...options]
```

or

```shell
yarn create @ama-sdk typescript <project-name> [...options]
```

> [!WARNING]
> Please notice that the command `yarn create` is **not** available for versions *>= 2.0.0* (see [Yarn cli commands](https://yarnpkg.com/cli)).

You can generate an environment with a specific package manager thanks to the `--package-manager` options:

```shell
npm create @ama-sdk typescript <project-name> -- --package-manager=yarn [...options]
```

## Options list

- `--package-manager`: Node package manager to be used (`npm` and `yarn` are available).
- `--debug --no-dry-run`: Enable schematics debug mode (dry-run is not currently supported).
- `--o3r-metrics`: Enable or disable the collection of anonymous data for Otter
- `--exact-o3r-version` : use a pinned version for [otter packages](https://github.com/AmadeusITGroup/otter/blob/main/docs/README.md).

- `--spec-path`: Path to the swagger/open-api specification used to generate the SDK
- `--spec-package-name`: The npm package name where the spec file can be fetched
- `--spec-package-path`: The path inside the package where to find the spec file
- `--spec-package-version`: The version to target for the npm package where the spec file can be fetched
- `--spec-package-registry`: The npm registry where the spec file can be fetched

> [!NOTE]
> If `--spec-path` or `--spec-package-name` is specified, the SDK will be generated based on this specification at the creation time.

> [!NOTE]
> > `--spec-package-registry` option assumes that the authentication is set up globally (See [npm setup](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc#auth-related-configuration), [yarn setup](https://yarnpkg.com/configuration/yarnrc#npmRegistries))
