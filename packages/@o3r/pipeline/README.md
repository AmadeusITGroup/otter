<h1 align="center">Otter Pipeline</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/pipeline?style=for-the-badge)](https://www.npmjs.com/package/@o3r/pipeline)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/pipeline?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/pipeline)

This module contains tooling around DevOps toolchains.

## How to install

```shell
ng add @o3r/pipeline
```

## Description

The `ng add` schematic for Otter Pipeline helps you set up a DevOps pipeline for your frontend project. This schematic configures the necessary CI runner and npm registry settings to streamline your development workflow.

### Properties

- `toolchain`: The DevOps toolchain to create. For now, only `GitHub` is supported.
- `runner`: The CI runner. Default is `ubuntu-latest`.
- `npmRegistry`: A custom npm registry. By default, the public one (https://registry.npmjs.org) will be used.

### Usage

Here is an example of how to use the `ng add` schematics with parameters:

```shell
ng add @o3r/pipeline --runner=windows-latest --npmRegistry=https://custom-registry.example.com
```

### Private NPM Registry

When a custom npm registry is provided, the schematic will automatically create a `.npmrc` (or a `.yarnrc`) file with the specified registry.
Additionally, it will set the necessary environment variables for the install task.

```yaml
- name: Install
  env:
    COREPACK_NPM_REGISTRY: https://custom-registry.example.com
    COREPACK_INTEGRITY_KEYS: ""
  shell: bash
  run: npm ci
```

If you choose to run the schematic without specifying an `npmRegistry`, you may need to manually apply these changes afterwards.

### GitHub workflow

The generated pipeline ensures that your code is built, tested and linted on every push or pull request to the main and release branches.

It also automates the versioning thanks to the [Otter - New Version GitHub Action](https://github.com/AmadeusITGroup/otter/tree/main/tools/github-actions/new-version#readme) and release process by creating a new release on GitHub and generating release notes.
