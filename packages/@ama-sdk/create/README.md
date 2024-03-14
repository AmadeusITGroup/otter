<h1 align="center">SDK project initializer</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

[![Stable Version](https://img.shields.io/npm/v/@ama-sdk/create)](https://www.npmjs.com/package/@ama-sdk/create)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-sdk/create?color=green)](https://www.npmjs.com/package/@ama-sdk/create)

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

- `--spec-path`: Path to the swagger/open-api specification used to generate the SDK
- `--package-manager`: Node package manager to be used (`npm` and `yarn` are available).
- `--debug`: Enable schematics debug mode (including dry run).
- `--exact-o3r-version` : use a pinned version for [otter packages](https://github.com/AmadeusITGroup/otter/blob/main/docs/README.md).

> [!NOTE]
> If the `--spec-path` is specified, the SDK will be generated based on this specification at the creation time.
