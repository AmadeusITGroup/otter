# Otter Module

Otter is a framework based on [Angular](https://angular.io/) which regroups a set of modules and provides tooling to make them communicate together.

## Definition

To be considered as an Otter Module, the package need to respect the following guidelines:

- The NPM package should expose `ng-add` and `ng-update` schematics.
- The module should report logs via the Logger exposed by the [@o3r/logging](https://www.npmjs.com/package/@o3r/logging)
- If the module exposes debug (or configuration) feature, it should be done via the debug interfaces exposed by [@o3r/core](https://www.npmjs.com/package/@o3r/core)

## Helpers packages

To help developers to create their own Otter compatible module, the Otter framework provides 3 technical modules:

- [@o3r/schematics](https://www.npmjs.com/package/@o3r/schematics): exposes helper functions to develop the module schematic features
- [@o3r/extractors](https://www.npmjs.com/package/@o3r/extractors): exposes helper functions to create code metadata extractor to help in CMS communication
- [@o3r/dev-tools](https://www.npmjs.com/package/@o3r/dev-tools): provides a collection of Command Line Interfaces which can be used in CI and build workflows

## List of Otter official modules

The full list of official modules can be found in the [Documentation Home page](../README.md#available-packages-and-tools).
