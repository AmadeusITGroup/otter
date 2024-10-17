<h1 align="center">Otter project initializer</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/create?style=for-the-badge)](https://www.npmjs.com/package/@o3r/create)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/create?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/create)

This package is an [NPM initializer](https://docs.npmjs.com/cli/v8/commands/npm-init) to generate a web application based on the [Otter Framework](https://github.com/AmadeusITGroup/otter).

## Create an Otter application

This package is simplifying the start of an [Otter Framework](https://github.com/AmadeusITGroup/otter) based application.

## Usage

```shell
npm create @o3r <project-name> -- [...options]
```

> [!WARNING]
> `yarn create` is not supported.

### Custom package manager

You can generate an environment with a specific package manager thanks to the `--package-manager` options:

```shell
npm create @o3r <project-name> -- --package-manager=yarn [...options]
```

> [!NOTE]
> At the moment, the ``package-manager`` option only supports `yarn` and `npm`.

### Custom registry

You can specify the npm's package registry to use.

```shell
npm create @o3r <project-name> --registry=<registry-url> -- [...options]
```

It will create a project with a `.npmrc` file configured to target the specified registry.
If the specified package manager is `yarn`, it will also configure the `.yarnrc.yml` file.

### Others available options

The generator accepts all the configurations from the Angular `ng new` command, see the [options list](https://angular.io/cli/new#options).
On top of them, the following options can be provided to the initializer:

- `--yarn-version`: specify the version of yarn to use (default: `latest`)
- `--exact-o3r-version`: use a pinned version for [Otter packages](https://github.com/AmadeusITGroup/otter/blob/main/docs/README.md).
