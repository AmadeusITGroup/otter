<h1 align="center">SDK project initializer</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Create an SDK package

This package is simplifying the start of new SDK repository.

## Usage

### NPM

```shell
npm create @ama-sdk typescript <package-name> -- [...options]
```

### Yarn

```shell
yarn create @ama-sdk typescript <project-name> [...options]
```

## Options list

- `--spec-path`: Path to the swagger/open-api specification used to generate the SDK
- `--package-manager`: Node package manager to be used (`npm` and `yarn` are available).
- `--debug`: Enable schematics debug mode (including dry run).

> **Note**: if the `--spec-path` is specified, the SDK will be generated based on this specification at the creation time.
