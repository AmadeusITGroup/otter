# Otter Module

Otter is a framework based on [Angular](https://angular.io/) which regroups a set of modules and provides tooling to make them communicate together.

## Definition

To be considered as an Otter Module, the package need to respect the following guidelines:

- The NPM package should expose `ng-add` and `ng-update` schematics.
- The module should report logs via the Logger exposed by the [@o3r/logging](https://www.npmjs.com/package/@o3r/logging)
- If the module exposes debug (or configuration) feature, it should be done via the debug interfaces exposed by [@o3r/core](https://www.npmjs.com/package/@o3r/core)

> **Note**: The full list of Otter modules is available on this [page](https://www.npmjs.com/search?q=keywords:otter-module).

## Helpers packages

To help developers to create their own Otter compatible module, the Otter framework provides 3 technical modules:

- [@o3r/schematics](https://www.npmjs.com/package/@o3r/schematics): exposes helper functions to develop the module schematic features
- [@o3r/extractors](https://www.npmjs.com/package/@o3r/extractors): exposes helper functions to create code metadata extractor to help in CMS communication
- [@o3r/dev-tools](https://www.npmjs.com/package/@o3r/dev-tools): provides a collection of Command Line Interfaces which can be used in CI and build workflows

## List of Otter official modules

The full list of official modules can be found in the [Documentation Home page](../README.md#available-packages-and-tools).

## How to create its own Otter module

You can simply generate an Otter module within your monorepo by running the following command:

```shell
ng generate @o3r/core:module
```

You can also manually create your own module by following the instructions of the next session.

### Module development

As indicated in the [definition section](#definition), an Otter module should expose a `ng-add` schematic to allow developers to install the module via the command `ng add <package-name>`.
> **Note**: Information relative to the `ng-add` schematics is available [here](https://angular.io/cli/add).

As all the Otter modules follow the same requirement, the new module can use provided helpers to trigger the installation of other Otter modules, through the `ng-add` schematic of the requested module.

To ensure and facilitate that, the `@o3r/core` provides a schematic which will generate the **ng add** skeleton files. Moreover, the helpers to trigger the installation of other Otter packages dependencies will be included.

Run the following command in the module where the `ng add` needs to be included:

```shell
ng generate @o3r/core:ng-add-create
```

> **Note**: To finish, make sure to run the `build:schematics` script in the process of packaging/publishing the new module.

### Register your module as official module

It could make sense that the developed module would be part of the modules proposed at the beginning of the Otter application.
To provide modules at Otter installation time, you just need to add the keyword `otter-module` in your module's package.json file as follows:

```json5
{
  "name": "@scope/my-module",
  "version": "0.0.0-placeholder",
  "description": "A description displayed in the console at build time",
  "keywords": [
    "some-keywords",
    "otter-modules"
  ]
}
```

> **Note**: Only the modules published to [npmjs.org](https://www.npmjs.com/) will be detected.
