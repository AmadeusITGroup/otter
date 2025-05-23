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

> [!WARNING]
> On Windows OS, [Git Bash terminal](https://gitforwindows.org/#bash) is not fully supported by different CLI used behind Otter project and can lead to execution error.
> We recommend to minimize its usage.

### Custom package manager

By default, the `npm` package manager will be used to generate the project, but you can generate an environment with a specific package manager using the `--package-manager` option:

```shell
npm create @o3r <project-name> -- --package-manager=yarn [...options]
```

> [!TIP]
> The option `--package-manager=yarn` can be simplified to `--yarn`.

> [!NOTE]
> At the moment, the `package-manager` option only supports `yarn` and `npm`.

### Custom registry

You can specify the npm's package registry to use.

```shell
npm create @o3r <project-name> --registry=<registry-url> -- [...options]
```

It will create a project with a `.npmrc` file configured to target the specified registry.
If the specified package manager is `yarn`, it will also configure the `.yarnrc.yml` file.

### Others available options

The generator accepts all the configurations from the Angular `ng new` command, see the [options list](https://angular.dev/cli/new#options).
On top of them, the following options can be provided to the initializer:

- `--yarn`: Enforce `yarn` package manager. This option will be ignored if `--package-manager` is already specified.
- `--yarn-version`: specify the version of yarn to use (default: `latest`)
- `--exact-o3r-version`: use a pinned version for [Otter packages](https://github.com/AmadeusITGroup/otter/blob/main/docs/README.md).
- `--preset <preset_name>`: the collection of Otter modules to install. If not provided, it defaults to `recommended`. The full list of presets is available in [@o3r/core](https://www.npmjs.com/package/@o3r/core#presets)
