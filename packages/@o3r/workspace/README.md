<h1 align="center">Otter Workspace</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

This package is an [Otter Framework](https://github.com/AmadeusITGroup/otter) Module providing tools at workspace level.

This packages provides several [Schematics](#schematics) and [CLIs](#scripts) used to accelerate the development and support maintenance of workspace's packages.

## Schematics

Otter framework provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics                 | Description                                                                   | How to use                        |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| add                        | Include Otter in a project workspace.                                         | `ng add @o3r/workspace`           |
| library                    | Add a new Library to the current Otter project                                | `ng g library`                    |
| sdk                        | Add a new SDK to the current Otter project                                    | `ng g sdk`                        |
| application                | Add a new Application to the current Otter project                            | `ng g application`                |

## Scripts

This packages exposes the following Command Line Interfaces:

### Set Version

Replaces the value of the `version` field of the `JSON` files matched by the pattern provided to the `--include` options.

```shell
Usage: o3r-set-version [options] <version>

Replace the packages version in a monorepos

Options:

  -p, --placeholder <placeholder>  Pattern of the version placeholder (default: 0.0.0)
  --include <file>                 Add files pattern to apply the verison replacement (default: */lerna.json,**/package.json,!**/node_modules/**/{package,lerna}.json)
  -V, --verbose                    Display debug logs
  -h, --help                       output usage information
```
