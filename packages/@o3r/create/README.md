<h1 align="center">Otter project initializer</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Create an Otter application

This package is simplifying the start of an [Otter Framework](https://github.com/AmadeusITGroup/otter) based application.

## Usage

```shell
npm create @o3r <project-name> -- [...options]
```

or

```shell
yarn create @o3r <project-name> [...options]
```

> **Warning** : Please notice that the command `yarn create` is **not** available for versions *>= 2.0.0* (see [Yarn cli commands](https://yarnpkg.com/cli)).

You can generate an environment with a specific package manager thanks to the `--package-manager` options:

```shell
npm create @o3r <project-name> -- --package-manager=yarn [...options]
```

## Available options

The generator accepts all the configurations from Angular `ng new` command, find the list [here](https://angular.io/cli/new#options).
On top of them, the following options can be provided to the initializer:

- `--yarn-version` : specify the version of yarn to use (default: `latest`)
